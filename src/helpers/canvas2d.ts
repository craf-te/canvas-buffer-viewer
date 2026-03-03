import type { CaptureData } from '../core/types';

/**
 * Read pixels from a Canvas2D context or canvas element.
 * Returns RGBA Uint8Array compatible with the viewer.
 */
export function readCanvas(
  source: HTMLCanvasElement | OffscreenCanvas | CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
): CaptureData {
  let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  if (source instanceof HTMLCanvasElement || source instanceof OffscreenCanvas) {
    ctx = source.getContext('2d')! as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  } else {
    ctx = source;
  }

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);

  return { data: new Uint8Array(imageData.data.buffer), width, height, flipY: false };
}
