import { WebGLRenderer } from 'three';
import { WebGLRenderTarget } from 'three';

export declare class BufferViewer {
    private static _instance;
    private _overlay;
    private _slots;
    private _active;
    private _disposed;
    private _fps;
    private constructor();
    static getInstance(options?: ViewerOptions): BufferViewer;
    get active(): boolean;
    set active(value: boolean);
    toggle(): void;
    setFps(fps: number): void;
    /**
     * Capture and display pixel data under the given label.
     * The getData callback is only invoked when the FPS throttle allows.
     * It should return { data, width, height } with RGBA pixel data.
     *
     * Call this at any point in your render pipeline.
     * The panel is auto-created on first use for each label.
     */
    capture(label: string, getData: () => CaptureData, note?: string): void;
    removeBuffer(label: string): void;
    dispose(): void;
    private _getOrCreateSlot;
}

export declare interface CaptureData {
    data: Uint8Array;
    width?: number;
    height?: number;
    /** Set to false for top-to-bottom data (e.g. Canvas2D). Defaults to true (WebGL bottom-to-top). */
    flipY?: boolean;
}

export declare type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Read pixels from a Canvas2D context or canvas element.
 * Returns RGBA Uint8Array compatible with the viewer.
 */
export declare function readCanvas(source: HTMLCanvasElement | OffscreenCanvas | CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): CaptureData;

/**
 * Read pixels from the current framebuffer (or screen) of a WebGL context.
 * If no framebuffer is bound, reads from the default (screen) framebuffer.
 */
export declare function readPixels(gl: WebGLRenderingContext | WebGL2RenderingContext, framebuffer?: WebGLFramebuffer | null): CaptureData;

/**
 * Read the color attachment of a Three.js WebGLRenderTarget
 * and return it as CaptureData for the viewer.
 */
export declare function readRenderTarget(renderer: WebGLRenderer, renderTarget: WebGLRenderTarget): CaptureData;

export declare interface ViewerOptions {
    active?: boolean;
    fps?: number;
    corner?: Corner;
}

export { }
