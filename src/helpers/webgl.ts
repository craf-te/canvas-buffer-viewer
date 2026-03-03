import type { CaptureData } from '../core/types';

/**
 * Read pixels from the current framebuffer (or screen) of a WebGL context.
 * If no framebuffer is bound, reads from the default (screen) framebuffer.
 */
export function readPixels(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  framebuffer?: WebGLFramebuffer | null,
): CaptureData {
  const prev = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
  if (framebuffer !== undefined) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  }

  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  const data = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);

  if (framebuffer !== undefined) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, prev);
  }

  return { data, width, height };
}
