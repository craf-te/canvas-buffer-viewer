export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ViewerOptions {
  active?: boolean;
  fps?: number;
  corner?: Corner;
}

export interface CaptureData {
  data: Uint8Array;
  width?: number;
  height?: number;
  /** Set to false for top-to-bottom data (e.g. Canvas2D). Defaults to true (WebGL bottom-to-top). */
  flipY?: boolean;
}
