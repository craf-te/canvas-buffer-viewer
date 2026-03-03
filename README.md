# Canvas Buffer Viewer 👀
[![npm version](https://img.shields.io/badge/dynamic/json?color=blue&label=npm&prefix=v&query=version&suffix=%20&url=https%3A%2F%2Fraw.githubusercontent.com%2Fcraf-te%2Fcanvas-buffer-viewer%2Fmain%2Fpackage.json)](https://www.npmjs.com/package/@craf-te/canvas-buffer-viewer)

[日本語](./README.ja.md)

A lightweight debug tool for visualizing WebGL framebuffers, render targets, and Canvas2D contents in real-time. Perfect for debugging complex rendering pipelines and post-processing effects.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Real-time visualization** of framebuffers and render targets as thumbnail overlays
- **FPS throttling** to minimize performance impact during debugging
- **Multi-framework support**: Three.js, raw WebGL, and Canvas2D
- **Automatic flip handling** for WebGL's bottom-to-top pixel order
- **Customizable positioning** (top-left, top-right, bottom-left, bottom-right)
- **Zero dependencies** - Three.js is optional and only needed for Three.js helpers
- **Web Components based** - encapsulated UI with Shadow DOM

## Installation

```bash
npm i @craf-te/canvas-buffer-viewer
```

## Quick Start

### Basic Usage

```typescript
import { BufferViewer } from 'canvas-buffer-viewer';

// Get the singleton instance
const viewer = BufferViewer.getInstance({
  fps: 10,           // Capture rate (default: 10)
  corner: 'top-right', // Position (default: 'top-right')
  active: true       // Start active (default: true)
});

// In your render loop, capture buffers
viewer.capture('My Buffer', () => ({
  data: pixelData,    // Uint8Array of RGBA pixels
  width: 512,
  height: 512,
  flipY: true         // true for WebGL (default), false for Canvas2D
}));
```

### Three.js Integration

```typescript
import { BufferViewer, readRenderTarget } from 'canvas-buffer-viewer';
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();
const renderTarget = new THREE.WebGLRenderTarget(512, 512);
const viewer = BufferViewer.getInstance({ fps: 20 });

function animate() {
  // Render to target
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera);

  // Capture for visualization
  viewer.capture('Scene RT', () => readRenderTarget(renderer, renderTarget));

  // Render to screen
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}
```

### Raw WebGL

```typescript
import { BufferViewer, readPixels } from 'canvas-buffer-viewer';

const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2');
const viewer = BufferViewer.getInstance();

function render() {
  // ... your WebGL rendering code ...

  // Capture the current framebuffer
  viewer.capture('Main FB', () => readPixels(gl));

  // Or capture a specific framebuffer
  viewer.capture('Shadow Map', () => readPixels(gl, shadowFramebuffer));

  requestAnimationFrame(render);
}
```

### Canvas2D

```typescript
import { BufferViewer, readCanvas } from 'canvas-buffer-viewer';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const viewer = BufferViewer.getInstance();

function render() {
  // ... your Canvas2D drawing code ...

  // Capture the canvas contents
  viewer.capture('2D Canvas', () => readCanvas(canvas));
  // Or pass the context directly
  viewer.capture('2D Canvas', () => readCanvas(ctx));

  requestAnimationFrame(render);
}
```

## API Reference

### `BufferViewer`

The main class for managing buffer visualization. Uses the singleton pattern.

#### `BufferViewer.getInstance(options?)`

Returns the singleton instance, creating it if necessary.

```typescript
interface ViewerOptions {
  active?: boolean;   // Start active (default: true)
  fps?: number;       // Capture rate limit (default: 10)
  corner?: Corner;    // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}
```

#### `viewer.capture(label, getData, note?)`

Capture and display buffer data.

- `label`: Unique identifier for this buffer slot
- `getData`: Callback returning `CaptureData` (only called when FPS throttle allows)
- `note`: Optional description text displayed below the label

```typescript
interface CaptureData {
  data: Uint8Array;   // RGBA pixel data
  width?: number;     // Required on first capture
  height?: number;    // Required on first capture
  flipY?: boolean;    // true for WebGL (default), false for Canvas2D
}
```

#### `viewer.active`

Get or set the active state. When inactive, captures are skipped and the overlay is hidden.

```typescript
viewer.active = false; // Hide the viewer
viewer.active = true;  // Show the viewer
```

#### `viewer.toggle()`

Toggle the viewer on/off.

#### `viewer.setFps(fps)`

Change the capture rate limit.

#### `viewer.removeBuffer(label)`

Remove a specific buffer from the display.

#### `viewer.dispose()`

Clean up all resources and remove the overlay.

### Helper Functions

#### `readRenderTarget(renderer, renderTarget)`

Read pixels from a Three.js `WebGLRenderTarget`.

```typescript
import { readRenderTarget } from 'canvas-buffer-viewer';

viewer.capture('RT', () => readRenderTarget(renderer, myRenderTarget));
```

#### `readPixels(gl, framebuffer?)`

Read pixels from a WebGL context. If `framebuffer` is omitted, reads from the current binding.

```typescript
import { readPixels } from 'canvas-buffer-viewer';

// Read from current framebuffer
viewer.capture('Current', () => readPixels(gl));

// Read from specific framebuffer
viewer.capture('Shadow', () => readPixels(gl, shadowFBO));
```

#### `readCanvas(source)`

Read pixels from a Canvas2D context or canvas element.

```typescript
import { readCanvas } from 'canvas-buffer-viewer';

viewer.capture('Canvas', () => readCanvas(canvas));
viewer.capture('Canvas', () => readCanvas(ctx));
```

## Debugging Post-Processing Pipelines

A common use case is debugging multi-pass rendering:

```typescript
import { BufferViewer, readRenderTarget } from 'canvas-buffer-viewer';

const viewer = BufferViewer.getInstance({ fps: 15 });

function render() {
  // Pass 1: Scene
  renderer.setRenderTarget(sceneRT);
  renderer.render(scene, camera);
  viewer.capture('Scene', () => readRenderTarget(renderer, sceneRT), 'Base scene render');

  // Pass 2: Bloom threshold
  renderer.setRenderTarget(bloomRT);
  renderer.render(bloomScene, postCamera);
  viewer.capture('Bloom', () => readRenderTarget(renderer, bloomRT), 'Bright pass');

  // Pass 3: Blur
  renderer.setRenderTarget(blurRT);
  renderer.render(blurScene, postCamera);
  viewer.capture('Blur', () => readRenderTarget(renderer, blurRT));

  // Final composite
  renderer.setRenderTarget(null);
  renderer.render(compositeScene, postCamera);

  requestAnimationFrame(render);
}
```

## Keyboard Shortcut Example

Add a toggle shortcut for convenience:

```typescript
const viewer = BufferViewer.getInstance({ active: false });

window.addEventListener('keydown', (e) => {
  if (e.key === 'F2') {
    viewer.toggle();
  }
});
```

## License

MIT
