import './FbViewerPanel';
import type { FbViewerPanel } from './FbViewerPanel';
import type { FbThumbnail } from './FbThumbnail';
import type { Corner } from '../core/types';

export class OverlayManager {
  private _panel: FbViewerPanel | null = null;
  private _corner: Corner;

  constructor(corner: Corner = 'top-right') {
    this._corner = corner;
  }

  mount(): void {
    if (this._panel) return;

    this._panel = document.createElement('fbv-panel') as FbViewerPanel;
    this._panel.corner = this._corner;
    document.body.appendChild(this._panel);
  }

  unmount(): void {
    if (!this._panel) return;
    this._panel.remove();
    this._panel = null;
  }

  addItem(label: string): FbThumbnail {
    if (!this._panel) {
      throw new Error('[BufferViewer] Not mounted yet.');
    }
    const existing = this._panel.getItem(label);
    if (existing) {
      return existing;
    }
    return this._panel.addThumbnail(label);
  }

  removeItem(label: string): void {
    if (!this._panel) return;
    this._panel.removeThumbnail(label);
  }

  getItem(label: string): FbThumbnail | undefined {
    return this._panel?.getItem(label);
  }

  get items(): IterableIterator<FbThumbnail> {
    if (!this._panel) return [].values();
    return this._panel.items.values();
  }

  dispose(): void {
    this.unmount();
  }
}
