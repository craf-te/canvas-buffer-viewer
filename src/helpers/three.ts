import { HalfFloatType, type WebGLRenderer, type WebGLRenderTarget } from 'three';
import type { CaptureData } from '../core/types';

/** Convert a IEEE 754 half-precision float (uint16) to a number. */
function halfToFloat(h: number): number {
  const sign = (h >> 15) & 0x1;
  const exp = (h >> 10) & 0x1f;
  const mant = h & 0x3ff;
  if (exp === 0) {
    // subnormal
    return (sign ? -1 : 1) * Math.pow(2, -14) * (mant / 1024);
  }
  if (exp === 0x1f) {
    return mant ? NaN : (sign ? -Infinity : Infinity);
  }
  return (sign ? -1 : 1) * Math.pow(2, exp - 15) * (1 + mant / 1024);
}

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
  const isHalf = renderTarget.texture.type === HalfFloatType;

  if (isHalf) {
    const halfData = new Uint16Array(width * height * 4);
    renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, halfData);
    const data = new Uint8Array(width * height * 4);
    for (let i = 0; i < halfData.length; i++) {
      data[i] = Math.min(255, Math.max(0, Math.round(halfToFloat(halfData[i]) * 255)));
    }
    return { data, width, height };
  }

  const data = new Uint8Array(width * height * 4);
  renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, data);
  return { data, width, height };
}
