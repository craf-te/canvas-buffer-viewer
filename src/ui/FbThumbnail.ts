import { thumbnailStyles } from './styles';

export class FbThumbnail extends HTMLElement {
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  private _labelEl!: HTMLDivElement;
  private _noteEl!: HTMLDivElement;
  private _noteTextEl!: HTMLSpanElement;

  private _label: string = '';
  private _lastWidth = 0;
  private _lastHeight = 0;
  private _lastNote: string | undefined = undefined;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
  }

  set label(val: string) {
    this._label = val;
    if (this._labelEl) {
      this._updateLabelText();
    }
  }

  get label(): string {
    return this._label;
  }

  get lastWidth() {
    return this._lastWidth;
  }

  get lastHeight() {
    return this._lastHeight;
  }

  private _render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>${thumbnailStyles}</style>
      <div class="fbv-buffer-header">
        <div class="fbv-buffer-label"></div>
        <div class="fbv-buffer-note" style="display: none;">
          <span class="fbv-buffer-note-text"></span>
        </div>
      </div>
      <canvas></canvas>
    `;

    this._labelEl = this.shadowRoot.querySelector('.fbv-buffer-label') as HTMLDivElement;
    this._noteEl = this.shadowRoot.querySelector('.fbv-buffer-note') as HTMLDivElement;
    this._noteTextEl = this.shadowRoot.querySelector('.fbv-buffer-note-text') as HTMLSpanElement;
    this.canvas = this.shadowRoot.querySelector('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this._updateLabelText();
  }

  private _updateLabelText() {
    if (this._lastWidth > 0 && this._lastHeight > 0) {
      this._labelEl.textContent = `${this._label} (${this._lastWidth}x${this._lastHeight})`;
    } else {
      this._labelEl.textContent = this._label;
    }
  }

  updateImage(data: Uint8Array, width: number, height: number, flipY = true, note?: string): void {
    if (!this.canvas) return;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    if (this._lastWidth !== width || this._lastHeight !== height) {
      this._lastWidth = width;
      this._lastHeight = height;
      this._updateLabelText();
    }

    if (this._lastNote !== note) {
      this._lastNote = note;
      if (note) {
        this._noteEl.style.display = 'block';
        this._noteTextEl.textContent = note;
        this._noteEl.title = note;

        this._noteTextEl.style.animation = 'none';
        void this._noteTextEl.offsetWidth; // force reflow
        this._noteTextEl.style.animation = '';
      } else {
        this._noteEl.style.display = 'none';
        this._noteTextEl.textContent = '';
        this._noteEl.title = '';
      }
    }

    const imageData = this.ctx.createImageData(width, height);

    if (flipY) {
      for (let y = 0; y < height; y++) {
        const srcRow = (height - 1 - y) * width * 4;
        const dstRow = y * width * 4;
        imageData.data.set(data.subarray(srcRow, srcRow + width * 4), dstRow);
      }
    } else {
      imageData.data.set(data);
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  dispose(): void {
    this.remove();
  }
}

if (!customElements.get('fbv-thumbnail')) {
  customElements.define('fbv-thumbnail', FbThumbnail);
}
