import type { WebGLRenderer, WebGLRenderTarget } from 'three';
import type { CaptureData } from '../core/types';

/**
 * Read the color attachment of a Three.js WebGLRenderTarget
 * and return it as CaptureData for the viewer.
 */
export function readRenderTarget(
  renderer: WebGLRenderer,
  renderTarget: WebGLRenderTarget,
): CaptureData {
  const width = renderTarget.width;
  const height = renderTarget.height;
  const data = new Uint8Array(width * height * 4);
  renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, data);
  return { data, width, height };
}
