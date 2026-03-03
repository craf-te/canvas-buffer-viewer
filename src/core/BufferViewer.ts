import type { ViewerOptions, CaptureData } from "./types";
import { ReadbackScheduler } from "./ReadbackScheduler";
import { OverlayManager } from "../ui/OverlayManager";
import type { FbThumbnail } from "../ui/FbThumbnail";

interface BufferSlot {
  scheduler: ReadbackScheduler;
  panel: FbThumbnail;
}

export class BufferViewer {
  private static _instance: BufferViewer | null = null;

  private _overlay: OverlayManager;
  private _slots: Map<string, BufferSlot> = new Map();
  private _active: boolean;
  private _disposed = false;
  private _fps: number;

  private constructor(options: ViewerOptions = {}) {
    this._fps = options.fps ?? 10;
    this._overlay = new OverlayManager(options.corner ?? "top-right");
    this._active = false;

    if (options.active !== false) {
      this.active = true;
    }
  }

  static getInstance(options?: ViewerOptions): BufferViewer {
    if (!BufferViewer._instance) {
      BufferViewer._instance = new BufferViewer(options);
    }
    return BufferViewer._instance;
  }

  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    if (this._disposed) return;
    this._active = value;
    if (value) {
      this._overlay.mount();
    } else {
      this._overlay.unmount();
    }
  }

  toggle(): void {
    this.active = !this._active;
  }

  setFps(fps: number): void {
    this._fps = fps;
    for (const slot of this._slots.values()) {
      slot.scheduler.setFps(fps);
    }
  }

  /**
   * Capture and display pixel data under the given label.
   * The getData callback is only invoked when the FPS throttle allows.
   * It should return { data, width, height } with RGBA pixel data.
   *
   * Call this at any point in your render pipeline.
   * The panel is auto-created on first use for each label.
   */
  capture(label: string, getData: () => CaptureData, note?: string): void {
    if (!this._active || this._disposed) return;

    const slot = this._getOrCreateSlot(label);

    const now = performance.now();
    if (!slot.scheduler.shouldCapture(now)) return;

    const capture = getData();
    const width = capture.width ?? slot.panel.lastWidth;
    const height = capture.height ?? slot.panel.lastHeight;

    if (!width || !height) {
      throw new Error(
        `[BufferViewer] "${label}": width/height required on first capture`,
      );
    }

    slot.panel.updateImage(capture.data, width, height, capture.flipY ?? true, note);
  }

  removeBuffer(label: string): void {
    if (this._slots.has(label)) {
      this._overlay.removeItem(label);
      this._slots.delete(label);
    }
  }

  dispose(): void {
    this._disposed = true;
    this._active = false;
    this._slots.clear();
    this._overlay.dispose();
    BufferViewer._instance = null;
  }

  private _getOrCreateSlot(label: string): BufferSlot {
    let slot = this._slots.get(label);
    if (!slot) {
      slot = {
        scheduler: new ReadbackScheduler(this._fps),
        panel: this._overlay.addItem(label),
      };
      this._slots.set(label, slot);
    }
    return slot;
  }
}
