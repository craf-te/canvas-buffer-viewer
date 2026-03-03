import * as THREE from "three";
import { BufferViewer } from "../src/index";
import { readRenderTarget } from "../src/helpers/three";
import { readPixels } from "../src/helpers/webgl";

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.set(0, 1.5, 3);
camera.lookAt(0, 0, 0);

scene.add(new THREE.AmbientLight(0x404060));
const directional = new THREE.DirectionalLight(0xffffff, 1.2);
directional.position.set(3, 5, 4);
scene.add(directional);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x4488ff, roughness: 0.4, metalness: 0.3 }),
);
cube.position.set(-1, 0.5, 0);
scene.add(cube);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xff4488, roughness: 0.3, metalness: 0.5 }),
);
sphere.position.set(1, 0.5, 0);
scene.add(sphere);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 8),
  new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 }),
);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// --- Fullscreen pass utility ---
const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const postGeom = new THREE.PlaneGeometry(2, 2);

function createPassScene(material: THREE.ShaderMaterial): THREE.Scene {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(postGeom, material));
  return s;
}

// --- Post-effect 1: Edge detection (Sobel) ---
const edgeMat = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: null },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float getLuminance(vec3 c) {
      return dot(c, vec3(0.299, 0.587, 0.114));
    }

    void main() {
      vec2 texel = vec2(1.0) / uResolution;

      float tl = getLuminance(texture2D(tDiffuse, vUv + vec2(-texel.x,  texel.y)).rgb);
      float tm = getLuminance(texture2D(tDiffuse, vUv + vec2( 0.0,      texel.y)).rgb);
      float tr = getLuminance(texture2D(tDiffuse, vUv + vec2( texel.x,  texel.y)).rgb);
      float ml = getLuminance(texture2D(tDiffuse, vUv + vec2(-texel.x,  0.0    )).rgb);
      float mr = getLuminance(texture2D(tDiffuse, vUv + vec2( texel.x,  0.0    )).rgb);
      float bl = getLuminance(texture2D(tDiffuse, vUv + vec2(-texel.x, -texel.y)).rgb);
      float bm = getLuminance(texture2D(tDiffuse, vUv + vec2( 0.0,     -texel.y)).rgb);
      float br = getLuminance(texture2D(tDiffuse, vUv + vec2( texel.x, -texel.y)).rgb);

      float gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
      float gy = -tl - 2.0*tm - tr + bl + 2.0*bm + br;
      float edge = sqrt(gx * gx + gy * gy);

      vec3 edgeColor = vec3(1.0) * edge;
      gl_FragColor = vec4(edgeColor, 1.0);
    }
  `,
});
const edgeScene = createPassScene(edgeMat);

// --- Post-effect 2: Pixelate (mosaic) ---
const pixelateMat = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: null },
    uPixelSize: { value: 8.0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uPixelSize;
    uniform vec2 uResolution;
    varying vec2 vUv;

    void main() {
      vec2 pixelGrid = vec2(uPixelSize) / uResolution;
      vec2 snapped = pixelGrid * floor(vUv / pixelGrid) + pixelGrid * 0.5;
      gl_FragColor = texture2D(tDiffuse, snapped);
    }
  `,
});
const pixelateScene = createPassScene(pixelateMat);

// --- Copy pass (for final output) ---
const copyMat = new THREE.ShaderMaterial({
  uniforms: { tDiffuse: { value: null } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      gl_FragColor = texture2D(tDiffuse, vUv);
    }
  `,
});
const copyScene = createPassScene(copyMat);

// --- Render targets ---
const makeRT = () => new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
const rtScene = makeRT();
const rtEdge = makeRT();
const rtPixelate = makeRT();

// --- Viewer ---
const viewer = BufferViewer.getInstance({ fps: 20 });

// --- Resize ---
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  for (const rt of [rtScene, rtEdge, rtPixelate]) rt.setSize(w, h);
  edgeMat.uniforms.uResolution.value.set(w, h);
  pixelateMat.uniforms.uResolution.value.set(w, h);
});

// --- Helper: run a post pass ---
function postPass(
  mat: THREE.ShaderMaterial,
  passScene: THREE.Scene,
  input: THREE.Texture,
  output: THREE.WebGLRenderTarget,
) {
  mat.uniforms.tDiffuse.value = input;
  renderer.setRenderTarget(output);
  renderer.render(passScene, postCamera);
}

// --- Animate ---
function animate() {
  const t = performance.now() * 0.001;

  cube.rotation.x = t * 0.5;
  cube.rotation.y = t * 0.7;
  sphere.position.y = 0.5 + Math.sin(t * 2) * 0.3;

  // 1) Base scene → rtScene
  renderer.setRenderTarget(rtScene);
  renderer.render(scene, camera);
  viewer.capture("Scene", () => readRenderTarget(renderer, rtScene), "Main 3D Scene rendered with simple lighting and materials. This text is long enough to trigger the marquee effect.");

  // 2) Edge detection → rtEdge
  postPass(edgeMat, edgeScene, rtScene.texture, rtEdge);
  viewer.capture("Edge", () => readRenderTarget(renderer, rtEdge), "Sobel edge detection post-process.");

  // 3) Pixelate (mosaic) → rtPixelate
  postPass(pixelateMat, pixelateScene, rtEdge.texture, rtPixelate);
  viewer.capture("Pixelate", () => readRenderTarget(renderer, rtPixelate));

  // 4) Final output to screen
  copyMat.uniforms.tDiffuse.value = rtPixelate.texture;
  renderer.setRenderTarget(null);
  renderer.render(copyScene, postCamera);
  viewer.capture("Screen", () => readPixels(renderer.getContext()));

  requestAnimationFrame(animate);
}

animate();
