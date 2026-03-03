import { hostStyles } from './styles';
import './FbThumbnail'; // ensure it's registered
import type { FbThumbnail } from './FbThumbnail';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface FbvState {
  width: number;
  height: number;
  top: number | null;
  left: number | null;
  minimized: boolean;
  maximized: boolean;
  selectedLabel: string | null;
}

const STORAGE_KEY = 'fbv-state';
const DEFAULT_WIDTH = 420;
const DEFAULT_HEIGHT = 240;
const PANEL_MARGIN = 12;
const GRID_GAP = 4;
const GRID_PADDING = 4;
const HEADER_HEIGHT = 22;

interface GridLayout {
  cols: number;
  rows: number;
  cellArea: number;
}

function getOptimalGrid(availableWidth: number, availableHeight: number, itemCount: number): GridLayout {
  if (itemCount <= 0) return { cols: 1, rows: 1, cellArea: 0 };
  if (itemCount === 1) {
    const w = availableWidth - GRID_PADDING * 2;
    const h = availableHeight - GRID_PADDING * 2;
    return { cols: 1, rows: 1, cellArea: w * h };
  }

  const usableWidth = availableWidth - GRID_PADDING * 2;
  const usableHeight = availableHeight - GRID_PADDING * 2;

  let bestLayout: GridLayout = { cols: 1, rows: itemCount, cellArea: 0 };

  // Try all valid (cols, rows) combinations
  for (let cols = 1; cols <= itemCount; cols++) {
    const rows = Math.ceil(itemCount / cols);

    // Calculate cell dimensions for this layout
    const cellWidth = (usableWidth - GRID_GAP * (cols - 1)) / cols;
    const cellHeight = (usableHeight - GRID_GAP * (rows - 1)) / rows;

    // Skip if cells would be too small
    if (cellWidth < 60 || cellHeight < 40) continue;

    const cellArea = cellWidth * cellHeight;

    if (cellArea > bestLayout.cellArea) {
      bestLayout = { cols, rows, cellArea };
    }
  }

  return bestLayout;
}

export class FbViewerPanel extends HTMLElement {
  private _corner: Corner = 'top-right';
  private _state: FbvState;
  private _initialPosSet = false;

  private _panelEl!: HTMLDivElement;
  private _gridEl!: HTMLDivElement;
  private _minimizeBtn!: HTMLButtonElement;
  private _restoreBtn!: HTMLButtonElement;
  private _maximizeBtn!: HTMLButtonElement;
  private _unmaximizeBtn!: HTMLButtonElement;
  private _backBtn!: HTMLButtonElement;

  private _preMaxState: { width: number, height: number, top: number|null, left: number|null } | null = null;
  private _selectedLabel: string | null = null;
  private _boundEscHandler: (e: KeyboardEvent) => void;
  private _resizeObserver: ResizeObserver | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Load state before render
    this._state = this._loadState();

    // ESC key handler
    this._boundEscHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (this._selectedLabel !== null) {
          this.deselectItem();
        } else if (this._state.maximized) {
          this._toggleMaximize(false);
        }
      }
    };
  }

  connectedCallback() {
    this._render();
    this._applyBottomAttribute();
    this._applyState();
    document.addEventListener('keydown', this._boundEscHandler);
    this._initResizeObserver();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._boundEscHandler);
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  set corner(c: Corner) {
    this._corner = c;
    this._applyBottomAttribute();
    if (!this._initialPosSet && this._state.top === null && this._state.left === null) {
      this._applyDefaultCornerPos();
    }
  }

  private _applyBottomAttribute(): void {
    const isBottom = this._corner.indexOf('bottom') >= 0;
    if (isBottom) {
      this.setAttribute('bottom', '');
    } else {
      this.removeAttribute('bottom');
    }
  }

  private _render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>${hostStyles}</style>
      <div class="fbv-panel">
        <div class="fbv-header">
          <button class="fbv-header-btn back-btn" title="リストに戻る" style="display:none;">\u2190</button>
          <span class="fbv-header-title">Framebuffer Viewer</span>
          <button class="fbv-header-btn reset-btn" title="Reset Position">\u21BA</button>
          <button class="fbv-header-btn minimize-btn" title="Minimize">\u2212</button>
          <button class="fbv-header-btn restore-btn" title="Restore" style="display:none;">\u25A1</button>
          <button class="fbv-header-btn maximize-btn" title="Maximize">\u25A3</button>
          <button class="fbv-header-btn unmaximize-btn" title="Unmaximize" style="display:none;">\u25A8</button>
        </div>
        <div class="fbv-grid"></div>
        <div class="fbv-resize fbv-resize-tl"></div>
        <div class="fbv-resize fbv-resize-tr"></div>
        <div class="fbv-resize fbv-resize-bl"></div>
        <div class="fbv-resize fbv-resize-br"></div>
      </div>
    `;

    this._panelEl = this.shadowRoot.querySelector('.fbv-panel') as HTMLDivElement;
    this._gridEl = this.shadowRoot.querySelector('.fbv-grid') as HTMLDivElement;
    this._minimizeBtn = this.shadowRoot.querySelector('.minimize-btn') as HTMLButtonElement;
    this._restoreBtn = this.shadowRoot.querySelector('.restore-btn') as HTMLButtonElement;
    this._maximizeBtn = this.shadowRoot.querySelector('.maximize-btn') as HTMLButtonElement;
    this._unmaximizeBtn = this.shadowRoot.querySelector('.unmaximize-btn') as HTMLButtonElement;
    this._backBtn = this.shadowRoot.querySelector('.back-btn') as HTMLButtonElement;

    // Header behaviors
    const header = this.shadowRoot.querySelector('.fbv-header') as HTMLDivElement;
    const resetBtn = this.shadowRoot.querySelector('.reset-btn') as HTMLButtonElement;

    this._initDrag(header);
    this._initResize();

    // Button Listeners
    this._minimizeBtn.addEventListener('click', (e) => { e.stopPropagation(); this._toggleMinimize(true); });
    this._restoreBtn.addEventListener('click', (e) => { e.stopPropagation(); this._toggleMinimize(false); });
    this._maximizeBtn.addEventListener('click', (e) => { e.stopPropagation(); this._toggleMaximize(true); });
    this._unmaximizeBtn.addEventListener('click', (e) => { e.stopPropagation(); this._toggleMaximize(false); });
    resetBtn.addEventListener('click', (e) => { e.stopPropagation(); this._resetState(); });
    this._backBtn.addEventListener('click', (e) => { e.stopPropagation(); this.deselectItem(); });

    // Thumbnail click handler (event delegation)
    this._gridEl.addEventListener('click', (e) => {
      const thumbnail = (e.target as HTMLElement).closest('fbv-thumbnail') as HTMLElement | null;
      if (!thumbnail) return;
      const label = thumbnail.dataset.label;
      if (!label) return;

      // Toggle: if already selected, deselect; otherwise select
      if (this._selectedLabel === label) {
        this.deselectItem();
      } else {
        this.selectItem(label);
      }
    });
  }

  // --- External API ---

  addThumbnail(label: string): FbThumbnail {
    const el = document.createElement('fbv-thumbnail') as FbThumbnail;
    el.label = label;
    el.dataset.label = label;
    this._gridEl.appendChild(el);
    this._updateGridColumns();

    // Restore selection if this item was previously selected
    if (this._selectedLabel === label) {
      this.selectItem(label);
    }

    return el;
  }

  removeThumbnail(label: string): void {
    const el = this._gridEl.querySelector(`fbv-thumbnail[data-label="${label}"]`);
    if (el) {
      // If removing the selected item, deselect first
      if (this._selectedLabel === label) {
        this.deselectItem();
      }
      el.remove();
      this._updateGridColumns();
    }
  }

  get items(): FbThumbnail[] {
    if (!this._gridEl) return [];
    return Array.from(this._gridEl.querySelectorAll('fbv-thumbnail')) as FbThumbnail[];
  }

  getItem(label: string): FbThumbnail | undefined {
    return this.items.find(i => i.label === label);
  }

  dispose(): void {
    this.remove();
  }

  // --- Selection API ---

  selectItem(label: string): void {
    const item = this.getItem(label);
    if (!item) return;

    // Clear previous selection
    this.items.forEach(el => el.classList.remove('selected'));

    // Apply new selection
    this._selectedLabel = label;
    item.classList.add('selected');
    this._gridEl.classList.add('single-view');
    this._backBtn.style.display = '';

    this._state.selectedLabel = label;
    this._saveState();
  }

  deselectItem(): void {
    this._selectedLabel = null;
    this.items.forEach(el => el.classList.remove('selected'));
    this._gridEl.classList.remove('single-view');
    this._backBtn.style.display = 'none';

    this._state.selectedLabel = null;
    this._saveState();
  }

  // --- Internal State & Layout ---

  private _updateGridColumns(): void {
    if (!this._gridEl || !this._panelEl) return;
    const width = this._panelEl.clientWidth;
    const height = this._panelEl.clientHeight - HEADER_HEIGHT;
    const layout = getOptimalGrid(width, height, this.items.length);
    this._gridEl.style.gridTemplateColumns = `repeat(${layout.cols}, 1fr)`;
    this._gridEl.style.gridTemplateRows = `repeat(${layout.rows}, 1fr)`;
  }

  private _initResizeObserver(): void {
    if (!this._panelEl) return;
    this._resizeObserver = new ResizeObserver(() => {
      this._updateGridColumns();
    });
    this._resizeObserver.observe(this._panelEl);
  }

  private _loadState(): FbvState {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure selectedLabel is present (migration from old state)
        if (!('selectedLabel' in parsed)) {
          parsed.selectedLabel = null;
        }
        return parsed;
      }
    } catch(e) {}

    return {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      top: null,
      left: null,
      minimized: false,
      maximized: false,
      selectedLabel: null
    };
  }

  private _saveState(): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    } catch(e) {}
  }

  private _applyState(): void {
    if (this._state.width && this._state.height) {
      this._panelEl.style.width = `${this._state.width}px`;
      this._panelEl.style.height = `${this._state.height}px`;
    }

    if (this._state.top !== null && this._state.left !== null) {
      this._panelEl.style.top = `${this._state.top}px`;
      this._panelEl.style.left = `${this._state.left}px`;
      this._initialPosSet = true;
    } else {
      this._applyDefaultCornerPos();
    }

    this._toggleMinimize(this._state.minimized, false);
    this._toggleMaximize(this._state.maximized, false);

    // Restore selection state (deferred to allow items to be added first)
    // The actual restoration happens when items are added
    this._selectedLabel = this._state.selectedLabel;
  }

  private _resetState(): void {
    this._state = {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      top: null,
      left: null,
      minimized: false,
      maximized: false,
      selectedLabel: null
    };
    this._initialPosSet = false;
    this._preMaxState = null;
    this.deselectItem();
    this._applyDefaultCornerPos();
    this._applyState();
    this._saveState();
  }

  private _applyDefaultCornerPos() {
    if (!this._panelEl) return;
    this._panelEl.style.width = `${DEFAULT_WIDTH}px`;
    this._panelEl.style.height = `${DEFAULT_HEIGHT}px`;
    this._panelEl.style.right = '';
    this._panelEl.style.bottom = '';

    const isTop = this._corner.indexOf('top') >= 0;
    const isLeft = this._corner.indexOf('left') >= 0;

    const top = isTop ? PANEL_MARGIN : window.innerHeight - DEFAULT_HEIGHT - PANEL_MARGIN;
    const left = isLeft ? PANEL_MARGIN : window.innerWidth - DEFAULT_WIDTH - PANEL_MARGIN;

    this._panelEl.style.top = `${top}px`;
    this._panelEl.style.left = `${left}px`;

    this._state.top = top;
    this._state.left = left;
    this._state.width = DEFAULT_WIDTH;
    this._state.height = DEFAULT_HEIGHT;
  }

  private _toggleMinimize(min: boolean, save = true): void {
    this._state.minimized = min;
    if (min) {
      this.setAttribute('minimized', '');
      this._minimizeBtn.style.display = 'none';
      this._restoreBtn.style.display = '';
      if (this._state.maximized) {
        // cannot be maximized and minimized easily
        this._toggleMaximize(false, false);
      }
    } else {
      this.removeAttribute('minimized');
      this._minimizeBtn.style.display = '';
      this._restoreBtn.style.display = 'none';
    }
    if (save) this._saveState();
  }

  private _toggleMaximize(max: boolean, save = true): void {
    this._state.maximized = max;
    if (max) {
      // Save pre-max state if we aren't already maxed
      if (!this.hasAttribute('maximized')) {
        this._preMaxState = {
          width: this._state.width,
          height: this._state.height,
          top: this._state.top,
          left: this._state.left
        };
      }
      this.setAttribute('maximized', '');
      this._maximizeBtn.style.display = 'none';
      this._unmaximizeBtn.style.display = '';

      if (this._state.minimized) {
        this._toggleMinimize(false, false);
      }
    } else {
      this.removeAttribute('maximized');
      this._maximizeBtn.style.display = '';
      this._unmaximizeBtn.style.display = 'none';

      // Restore pre-max state visually
      if (this._preMaxState) {
        this._state.width = this._preMaxState.width;
        this._state.height = this._preMaxState.height;
        this._state.top = this._preMaxState.top;
        this._state.left = this._preMaxState.left;
        this._panelEl.style.width = `${this._state.width}px`;
        this._panelEl.style.height = `${this._state.height}px`;
        this._panelEl.style.top = `${this._state.top}px`;
        this._panelEl.style.left = `${this._state.left}px`;
      }
    }
    if (save) this._saveState();
  }

  // --- Drag & Drop ---
  private _initDrag(handle: HTMLElement): void {
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    const onMouseMove = (e: MouseEvent) => {
      let nx = startLeft + (e.clientX - startX);
      let ny = startTop + (e.clientY - startY);
      this._panelEl.style.left = `${nx}px`;
      this._panelEl.style.top = `${ny}px`;
    };

    const onMouseUp = () => {
      this._panelEl.classList.remove('dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      const rect = this._panelEl.getBoundingClientRect();
      this._state.left = rect.left;
      this._state.top = rect.top;
      this._saveState();
    };

    const startDrag = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName.toLowerCase() === 'button') return;
      if (this._state.maximized) return; // Disallow drag if maximized

      e.preventDefault();
      this._panelEl.classList.add('dragging');

      const rect = this._panelEl.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    // Header drag
    handle.addEventListener('mousedown', startDrag);

    // Edge drag: allow dragging from panel border area when header is off-screen
    this._panelEl.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      // Skip if clicking inside grid content, resize handle, header, or buttons
      if (target.closest('.fbv-grid') ||
          target.closest('.fbv-resize') ||
          target.closest('.fbv-header') ||
          target.closest('fbv-thumbnail')) {
        return;
      }
      // Allow drag from panel border area
      startDrag(e);
    });
  }

  // --- Resize ---
  private _initResize(): void {
    const corners = ['tl', 'tr', 'bl', 'br'] as const;

    corners.forEach(corner => {
      const handle = this.shadowRoot?.querySelector(`.fbv-resize-${corner}`) as HTMLDivElement;
      if (!handle) return;

      handle.addEventListener('mousedown', (e) => {
        if (this._state.maximized) return;

        e.preventDefault();
        e.stopPropagation();
        this._panelEl.classList.add('resizing');

        const startX = e.clientX;
        const startY = e.clientY;
        const rect = this._panelEl.getBoundingClientRect();
        const startW = rect.width;
        const startH = rect.height;
        const startTop = rect.top;
        const startLeft = rect.left;

        const onMouseMove = (e: MouseEvent) => {
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;

          let newW = startW;
          let newH = startH;
          let newTop = startTop;
          let newLeft = startLeft;

          // Handle horizontal resize
          if (corner === 'tl' || corner === 'bl') {
            // Left corners: resize from left edge
            newW = Math.max(200, startW - dx);
            newLeft = startLeft + (startW - newW);
          } else {
            // Right corners: resize from right edge
            newW = Math.max(200, startW + dx);
          }

          // Handle vertical resize
          if (corner === 'tl' || corner === 'tr') {
            // Top corners: resize from top edge
            newH = Math.max(120, startH - dy);
            newTop = startTop + (startH - newH);
          } else {
            // Bottom corners: resize from bottom edge
            newH = Math.max(120, startH + dy);
          }

          this._panelEl.style.width = `${newW}px`;
          this._panelEl.style.height = `${newH}px`;
          this._panelEl.style.top = `${newTop}px`;
          this._panelEl.style.left = `${newLeft}px`;
        };

        const onMouseUp = () => {
          this._panelEl.classList.remove('resizing');
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);

          const rect = this._panelEl.getBoundingClientRect();
          this._state.width = rect.width;
          this._state.height = rect.height;
          this._state.top = rect.top;
          this._state.left = rect.left;
          this._saveState();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
  }
}

if (!customElements.get('fbv-panel')) {
  customElements.define('fbv-panel', FbViewerPanel);
}
