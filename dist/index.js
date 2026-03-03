class C {
  constructor(t = 10) {
    this._lastCapture = 0, this._interval = 1e3 / t;
  }
  setFps(t) {
    this._interval = 1e3 / t;
  }
  shouldCapture(t) {
    return t - this._lastCapture < this._interval ? !1 : (this._lastCapture = t, !0);
  }
}
const B = (
  /* css */
  `
  :host {
    position: fixed;
    pointer-events: none;
    z-index: 99999;
    font-family: monospace;
    font-size: 12px;
    color: #fff;
    /* initial placeholder to not break while drag happens on the panel itself */
    inset: 0;
  }

  .fbv-panel {
    position: absolute;
    pointer-events: auto;
    background: rgba(0, 0, 0, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 4px;
    overflow: visible;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    min-height: 120px;
    transition: width 0.3s ease, height 0.3s ease, top 0.3s ease, left 0.3s ease;
  }

  /* Bottom position: header at bottom, content opens upward */
  :host([bottom]) .fbv-panel {
    flex-direction: column-reverse;
  }

  :host([bottom]) .fbv-header {
    border-radius: 0 0 4px 4px;
  }

  :host([bottom]) .fbv-grid {
    border-radius: 4px 4px 0 0;
  }

  /* Invisible hit area for edge dragging */
  .fbv-panel::before {
    content: '';
    position: absolute;
    inset: -8px;
    cursor: grab;
    pointer-events: auto;
    z-index: -1;
  }

  .fbv-panel:active::before {
    cursor: grabbing;
  }

  /* Clip inner content to panel bounds */
  .fbv-panel .fbv-grid {
    overflow: hidden;
  }

  /* Disable transition when dragging/resizing for immediate feedback */
  .fbv-panel.dragging, .fbv-panel.resizing {
    transition: none;
  }

  /* Maximize state overrides */
  :host([maximized]) .fbv-panel {
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    border-radius: 0;
    border: none;
  }

  :host([minimized]) .fbv-panel {
    min-height: auto;
    height: auto !important;
  }

  :host([minimized]) .fbv-grid,
  :host([minimized]) .fbv-resize {
    display: none;
  }

  .fbv-header {
    display: flex;
    align-items: center;
    padding: 2px 6px;
    background: rgba(255, 255, 255, 0.1);
    cursor: grab;
    user-select: none;
    font-size: 11px;
    line-height: 18px;
  }

  .fbv-header:active {
    cursor: grabbing;
  }

  .fbv-header-title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .fbv-header-btn {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin-left: 2px;
    padding: 0;
    border: none;
    background: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    line-height: 18px;
    text-align: center;
    cursor: pointer;
    border-radius: 2px;
  }

  .fbv-header-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  .fbv-header-btn.back-btn {
    margin-right: 6px;
    font-size: 16px;
  }

  .fbv-grid {
    flex: 1;
    display: grid;
    gap: 4px;
    padding: 4px;
    overflow: hidden;
  }

  .fbv-grid.single-view {
    display: block;
    padding: 0;
  }

  .fbv-grid.single-view fbv-thumbnail {
    display: none;
  }

  .fbv-grid.single-view fbv-thumbnail.selected {
    display: flex;
    height: 100%;
    width: 100%;
  }

  /* Hover effect for thumbnails in list view */
  .fbv-grid:not(.single-view) fbv-thumbnail:hover {
    outline: 2px solid rgba(100, 180, 255, 0.7);
    outline-offset: -2px;
  }

  .fbv-resize {
    position: absolute;
    width: 16px;
    height: 16px;
  }

  .fbv-resize-tl {
    top: -4px;
    left: -4px;
    cursor: nwse-resize;
  }

  .fbv-resize-tr {
    top: -4px;
    right: -4px;
    cursor: nesw-resize;
  }

  .fbv-resize-bl {
    bottom: -4px;
    left: -4px;
    cursor: nesw-resize;
  }

  .fbv-resize-br {
    bottom: -4px;
    right: -4px;
    cursor: nwse-resize;
  }
`
), T = (
  /* css */
  `
  :host {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    font-family: monospace;
    color: #fff;
    cursor: pointer;
  }

  /* Hide thumbnails in single-view mode, show only selected */
  :host-context(.single-view) {
    display: none;
  }

  :host-context(.single-view):host(.selected) {
    display: flex;
    height: 100%;
    width: 100%;
  }

  .fbv-buffer-header {
    display: flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .fbv-buffer-label {
    padding: 2px 4px;
    font-size: 10px;
    line-height: 14px;
    opacity: 0.8;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .fbv-buffer-note {
    flex-grow: 1;
    margin-left: 4px;
    overflow: hidden;
    white-space: nowrap;
    font-size: 10px;
    color: #bbb;
    position: relative;
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    padding-left: 4px;
    cursor: help;
  }

  .fbv-buffer-note-text {
    display: inline-block;
    padding-right: 100%;
    animation: fbv-marquee 10s linear infinite;
  }

  .fbv-buffer-note:hover .fbv-buffer-note-text {
    animation-play-state: paused;
  }

  .fbv-buffer-note::after {
    content: attr(title);
    position: absolute;
    left: 4px;
    top: 100%;
    margin-top: 2px;
    background: rgba(0, 0, 0, 0.9);
    color: #fff;
    padding: 4px 6px;
    border-radius: 2px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    font-size: 10px;
    white-space: normal;
    word-wrap: break-word;
    max-width: 200px;
    z-index: 100000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    display: none;
  }

  .fbv-buffer-note:hover::after {
    display: block;
    opacity: 1;
  }

  @keyframes fbv-marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }

  canvas {
    flex: 1;
    width: 100%;
    min-height: 0;
    display: block;
    image-rendering: pixelated;
    object-fit: contain;
  }
`
);
class W extends HTMLElement {
  constructor() {
    super(), this._label = "", this._lastWidth = 0, this._lastHeight = 0, this._lastNote = void 0, this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this._render();
  }
  set label(t) {
    this._label = t, this._labelEl && this._updateLabelText();
  }
  get label() {
    return this._label;
  }
  get lastWidth() {
    return this._lastWidth;
  }
  get lastHeight() {
    return this._lastHeight;
  }
  _render() {
    this.shadowRoot && (this.shadowRoot.innerHTML = `
      <style>${T}</style>
      <div class="fbv-buffer-header">
        <div class="fbv-buffer-label"></div>
        <div class="fbv-buffer-note" style="display: none;">
          <span class="fbv-buffer-note-text"></span>
        </div>
      </div>
      <canvas></canvas>
    `, this._labelEl = this.shadowRoot.querySelector(".fbv-buffer-label"), this._noteEl = this.shadowRoot.querySelector(".fbv-buffer-note"), this._noteTextEl = this.shadowRoot.querySelector(".fbv-buffer-note-text"), this.canvas = this.shadowRoot.querySelector("canvas"), this.ctx = this.canvas.getContext("2d"), this._updateLabelText());
  }
  _updateLabelText() {
    this._lastWidth > 0 && this._lastHeight > 0 ? this._labelEl.textContent = `${this._label} (${this._lastWidth}x${this._lastHeight})` : this._labelEl.textContent = this._label;
  }
  updateImage(t, e, i, n = !0, s) {
    if (!this.canvas) return;
    (this.canvas.width !== e || this.canvas.height !== i) && (this.canvas.width = e, this.canvas.height = i), (this._lastWidth !== e || this._lastHeight !== i) && (this._lastWidth = e, this._lastHeight = i, this._updateLabelText()), this._lastNote !== s && (this._lastNote = s, s ? (this._noteEl.style.display = "block", this._noteTextEl.textContent = s, this._noteEl.title = s, this._noteTextEl.style.animation = "none", this._noteTextEl.offsetWidth, this._noteTextEl.style.animation = "") : (this._noteEl.style.display = "none", this._noteTextEl.textContent = "", this._noteEl.title = ""));
    const l = this.ctx.createImageData(e, i);
    if (n)
      for (let h = 0; h < i; h++) {
        const a = (i - 1 - h) * e * 4, o = h * e * 4;
        l.data.set(t.subarray(a, a + e * 4), o);
      }
    else
      l.data.set(t);
    this.ctx.putImageData(l, 0, 0);
  }
  dispose() {
    this.remove();
  }
}
customElements.get("fbv-thumbnail") || customElements.define("fbv-thumbnail", W);
const k = "fbv-state", v = 420, g = 240, y = 12, I = 4, E = 4, H = 22;
function M(r, t, e) {
  if (e <= 0) return { cols: 1, rows: 1, cellArea: 0 };
  if (e === 1) {
    const l = r - E * 2, h = t - E * 2;
    return { cols: 1, rows: 1, cellArea: l * h };
  }
  const i = r - E * 2, n = t - E * 2;
  let s = { cols: 1, rows: e, cellArea: 0 };
  for (let l = 1; l <= e; l++) {
    const h = Math.ceil(e / l), a = (i - I * (l - 1)) / l, o = (n - I * (h - 1)) / h;
    if (a < 60 || o < 40) continue;
    const d = a * o;
    d > s.cellArea && (s = { cols: l, rows: h, cellArea: d });
  }
  return s;
}
class P extends HTMLElement {
  constructor() {
    super(), this._corner = "top-right", this._initialPosSet = !1, this._preMaxState = null, this._popoutWindow = null, this._popoutCheckInterval = null, this._selectedLabel = null, this._resizeObserver = null, this.attachShadow({ mode: "open" }), this._state = this._loadState(), this._boundEscHandler = (t) => {
      t.key === "Escape" && (this._selectedLabel !== null ? this.deselectItem() : this._state.maximized && this._toggleMaximize(!1));
    };
  }
  connectedCallback() {
    this._render(), this._applyBottomAttribute(), this._applyState(), document.addEventListener("keydown", this._boundEscHandler), this._initResizeObserver();
  }
  disconnectedCallback() {
    var t;
    document.removeEventListener("keydown", this._boundEscHandler), (t = this._resizeObserver) == null || t.disconnect(), this._resizeObserver = null, this._closePopout();
  }
  set corner(t) {
    this._corner = t, this._applyBottomAttribute(), !this._initialPosSet && this._state.top === null && this._state.left === null && this._applyDefaultCornerPos();
  }
  _applyBottomAttribute() {
    this._corner.indexOf("bottom") >= 0 ? this.setAttribute("bottom", "") : this.removeAttribute("bottom");
  }
  _render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>${B}</style>
      <div class="fbv-panel">
        <div class="fbv-header">
          <button class="fbv-header-btn back-btn" title="リストに戻る" style="display:none;">←</button>
          <span class="fbv-header-title">Framebuffer Viewer</span>
          <button class="fbv-header-btn popout-btn" title="別ウィンドウで表示">↗</button>
          <button class="fbv-header-btn reset-btn" title="Reset Position">↺</button>
          <button class="fbv-header-btn minimize-btn" title="Minimize">−</button>
          <button class="fbv-header-btn restore-btn" title="Restore" style="display:none;">□</button>
          <button class="fbv-header-btn maximize-btn" title="Maximize">▣</button>
          <button class="fbv-header-btn unmaximize-btn" title="Unmaximize" style="display:none;">▨</button>
        </div>
        <div class="fbv-grid"></div>
        <div class="fbv-resize fbv-resize-tl"></div>
        <div class="fbv-resize fbv-resize-tr"></div>
        <div class="fbv-resize fbv-resize-bl"></div>
        <div class="fbv-resize fbv-resize-br"></div>
      </div>
    `, this._panelEl = this.shadowRoot.querySelector(".fbv-panel"), this._gridEl = this.shadowRoot.querySelector(".fbv-grid"), this._minimizeBtn = this.shadowRoot.querySelector(".minimize-btn"), this._restoreBtn = this.shadowRoot.querySelector(".restore-btn"), this._maximizeBtn = this.shadowRoot.querySelector(".maximize-btn"), this._unmaximizeBtn = this.shadowRoot.querySelector(".unmaximize-btn"), this._backBtn = this.shadowRoot.querySelector(".back-btn"), this._popoutBtn = this.shadowRoot.querySelector(".popout-btn");
    const t = this.shadowRoot.querySelector(".fbv-header"), e = this.shadowRoot.querySelector(".reset-btn");
    this._initDrag(t), this._initResize(), this._minimizeBtn.addEventListener("click", (i) => {
      i.stopPropagation(), this._toggleMinimize(!0);
    }), this._restoreBtn.addEventListener("click", (i) => {
      i.stopPropagation(), this._toggleMinimize(!1);
    }), this._maximizeBtn.addEventListener("click", (i) => {
      i.stopPropagation(), this._toggleMaximize(!0);
    }), this._unmaximizeBtn.addEventListener("click", (i) => {
      i.stopPropagation(), this._toggleMaximize(!1);
    }), e.addEventListener("click", (i) => {
      i.stopPropagation(), this._resetState();
    }), this._backBtn.addEventListener("click", (i) => {
      i.stopPropagation(), this.deselectItem();
    }), this._popoutBtn.addEventListener("click", (i) => {
      i.stopPropagation(), this._togglePopout();
    }), this._gridEl.addEventListener("click", (i) => {
      const n = i.target.closest("fbv-thumbnail");
      if (!n) return;
      const s = n.dataset.label;
      s && (this._selectedLabel === s ? this.deselectItem() : this.selectItem(s));
    });
  }
  // --- External API ---
  addThumbnail(t) {
    const e = document.createElement("fbv-thumbnail");
    return e.label = t, e.dataset.label = t, this._gridEl.appendChild(e), this._updateGridColumns(), this._selectedLabel === t && this.selectItem(t), e;
  }
  removeThumbnail(t) {
    const e = this._gridEl.querySelector(`fbv-thumbnail[data-label="${t}"]`);
    e && (this._selectedLabel === t && this.deselectItem(), e.remove(), this._updateGridColumns());
  }
  get items() {
    return this._gridEl ? Array.from(this._gridEl.querySelectorAll("fbv-thumbnail")) : [];
  }
  getItem(t) {
    return this.items.find((e) => e.label === t);
  }
  dispose() {
    this.remove();
  }
  // --- Selection API ---
  selectItem(t) {
    const e = this.getItem(t);
    e && (this.items.forEach((i) => i.classList.remove("selected")), this._selectedLabel = t, e.classList.add("selected"), this._gridEl.classList.add("single-view"), this._backBtn.style.display = "", this._state.selectedLabel = t, this._saveState());
  }
  deselectItem() {
    this._selectedLabel = null, this.items.forEach((t) => t.classList.remove("selected")), this._gridEl.classList.remove("single-view"), this._backBtn.style.display = "none", this._state.selectedLabel = null, this._saveState();
  }
  // --- Internal State & Layout ---
  _updateGridColumns() {
    if (!this._gridEl || !this._panelEl) return;
    const t = this._panelEl.clientWidth, e = this._panelEl.clientHeight - H, i = M(t, e, this.items.length);
    this._gridEl.style.gridTemplateColumns = `repeat(${i.cols}, 1fr)`, this._gridEl.style.gridTemplateRows = `repeat(${i.rows}, 1fr)`;
  }
  _initResizeObserver() {
    this._panelEl && (this._resizeObserver = new ResizeObserver(() => {
      this._updateGridColumns();
    }), this._resizeObserver.observe(this._panelEl));
  }
  _loadState() {
    try {
      const t = sessionStorage.getItem(k);
      if (t) {
        const e = JSON.parse(t);
        return "selectedLabel" in e || (e.selectedLabel = null), e;
      }
    } catch {
    }
    return {
      width: v,
      height: g,
      top: null,
      left: null,
      minimized: !1,
      maximized: !1,
      selectedLabel: null
    };
  }
  _saveState() {
    try {
      sessionStorage.setItem(k, JSON.stringify(this._state));
    } catch {
    }
  }
  _applyState() {
    this._state.width && this._state.height && (this._panelEl.style.width = `${this._state.width}px`, this._panelEl.style.height = `${this._state.height}px`), this._state.top !== null && this._state.left !== null ? (this._panelEl.style.top = `${this._state.top}px`, this._panelEl.style.left = `${this._state.left}px`, this._initialPosSet = !0) : this._applyDefaultCornerPos(), this._toggleMinimize(this._state.minimized, !1), this._toggleMaximize(this._state.maximized, !1), this._selectedLabel = this._state.selectedLabel;
  }
  _resetState() {
    this._state = {
      width: v,
      height: g,
      top: null,
      left: null,
      minimized: !1,
      maximized: !1,
      selectedLabel: null
    }, this._initialPosSet = !1, this._preMaxState = null, this.deselectItem(), this._applyDefaultCornerPos(), this._applyState(), this._saveState();
  }
  _applyDefaultCornerPos() {
    if (!this._panelEl) return;
    this._panelEl.style.width = `${v}px`, this._panelEl.style.height = `${g}px`, this._panelEl.style.right = "", this._panelEl.style.bottom = "";
    const t = this._corner.indexOf("top") >= 0, e = this._corner.indexOf("left") >= 0, i = t ? y : window.innerHeight - g - y, n = e ? y : window.innerWidth - v - y;
    this._panelEl.style.top = `${i}px`, this._panelEl.style.left = `${n}px`, this._state.top = i, this._state.left = n, this._state.width = v, this._state.height = g;
  }
  _toggleMinimize(t, e = !0) {
    this._state.minimized = t, t ? (this.setAttribute("minimized", ""), this._minimizeBtn.style.display = "none", this._restoreBtn.style.display = "", this._state.maximized && this._toggleMaximize(!1, !1)) : (this.removeAttribute("minimized"), this._minimizeBtn.style.display = "", this._restoreBtn.style.display = "none"), e && this._saveState();
  }
  _toggleMaximize(t, e = !0) {
    this._state.maximized = t, t ? (this.hasAttribute("maximized") || (this._preMaxState = {
      width: this._state.width,
      height: this._state.height,
      top: this._state.top,
      left: this._state.left
    }), this.setAttribute("maximized", ""), this._maximizeBtn.style.display = "none", this._unmaximizeBtn.style.display = "", this._state.minimized && this._toggleMinimize(!1, !1)) : (this.removeAttribute("maximized"), this._maximizeBtn.style.display = "", this._unmaximizeBtn.style.display = "none", this._preMaxState && (this._state.width = this._preMaxState.width, this._state.height = this._preMaxState.height, this._state.top = this._preMaxState.top, this._state.left = this._preMaxState.left, this._panelEl.style.width = `${this._state.width}px`, this._panelEl.style.height = `${this._state.height}px`, this._panelEl.style.top = `${this._state.top}px`, this._panelEl.style.left = `${this._state.left}px`)), e && this._saveState();
  }
  // --- Drag & Drop ---
  _initDrag(t) {
    let e = 0, i = 0, n = 0, s = 0;
    const l = (o) => {
      let d = n + (o.clientX - e), b = s + (o.clientY - i);
      this._panelEl.style.left = `${d}px`, this._panelEl.style.top = `${b}px`;
    }, h = () => {
      this._panelEl.classList.remove("dragging"), document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", h);
      const o = this._panelEl.getBoundingClientRect();
      this._state.left = o.left, this._state.top = o.top, this._saveState();
    }, a = (o) => {
      if (o.target.tagName.toLowerCase() === "button" || this._state.maximized) return;
      o.preventDefault(), this._panelEl.classList.add("dragging");
      const d = this._panelEl.getBoundingClientRect();
      e = o.clientX, i = o.clientY, n = d.left, s = d.top, document.addEventListener("mousemove", l), document.addEventListener("mouseup", h);
    };
    t.addEventListener("mousedown", a), this._panelEl.addEventListener("mousedown", (o) => {
      const d = o.target;
      d.closest(".fbv-grid") || d.closest(".fbv-resize") || d.closest(".fbv-header") || d.closest("fbv-thumbnail") || a(o);
    });
  }
  // --- Resize ---
  _initResize() {
    ["tl", "tr", "bl", "br"].forEach((e) => {
      var n;
      const i = (n = this.shadowRoot) == null ? void 0 : n.querySelector(`.fbv-resize-${e}`);
      i && i.addEventListener("mousedown", (s) => {
        if (this._state.maximized) return;
        s.preventDefault(), s.stopPropagation(), this._panelEl.classList.add("resizing");
        const l = s.clientX, h = s.clientY, a = this._panelEl.getBoundingClientRect(), o = a.width, d = a.height, b = a.top, c = a.left, _ = (p) => {
          const m = p.clientX - l, z = p.clientY - h;
          let x = o, w = d, L = b, S = c;
          e === "tl" || e === "bl" ? (x = Math.max(200, o - m), S = c + (o - x)) : x = Math.max(200, o + m), e === "tl" || e === "tr" ? (w = Math.max(120, d - z), L = b + (d - w)) : w = Math.max(120, d + z), this._panelEl.style.width = `${x}px`, this._panelEl.style.height = `${w}px`, this._panelEl.style.top = `${L}px`, this._panelEl.style.left = `${S}px`;
        }, f = () => {
          this._panelEl.classList.remove("resizing"), document.removeEventListener("mousemove", _), document.removeEventListener("mouseup", f);
          const p = this._panelEl.getBoundingClientRect();
          this._state.width = p.width, this._state.height = p.height, this._state.top = p.top, this._state.left = p.left, this._saveState();
        };
        document.addEventListener("mousemove", _), document.addEventListener("mouseup", f);
      });
    });
  }
  // --- Popout Window ---
  _togglePopout() {
    if (this._popoutWindow && !this._popoutWindow.closed) {
      this._popoutWindow.focus();
      return;
    }
    const t = Math.max(this._state.width, 500), e = Math.max(this._state.height, 400), i = window.screenX + (window.innerWidth - t) / 2, n = window.screenY + (window.innerHeight - e) / 2;
    if (this._popoutWindow = window.open(
      "",
      "fbv-popout",
      `width=${t},height=${e},left=${i},top=${n},resizable=yes`
    ), !this._popoutWindow) {
      console.warn("Framebuffer Viewer: Popup blocked");
      return;
    }
    const s = this._popoutWindow.document;
    s.title = "Framebuffer Viewer", s.head.innerHTML = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          width: 100%;
          height: 100%;
          background: #1a1a1a;
          font-family: monospace;
          overflow: hidden;
        }
        .popout-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .popout-header {
          display: flex;
          align-items: center;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 12px;
          user-select: none;
        }
        .popout-header-title {
          flex: 1;
        }
        .popout-header-btn {
          width: 24px;
          height: 24px;
          margin-left: 4px;
          padding: 0;
          border: none;
          background: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 16px;
          cursor: pointer;
          border-radius: 2px;
        }
        .popout-header-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
        }
        .popout-grid {
          flex: 1;
          display: grid;
          gap: 4px;
          padding: 4px;
          overflow: hidden;
        }
        .popout-grid.single-view {
          display: block;
          padding: 0;
        }
        .popout-grid.single-view fbv-thumbnail {
          display: none;
        }
        .popout-grid.single-view fbv-thumbnail.selected {
          display: flex;
          height: 100%;
          width: 100%;
        }
      </style>
    `;
    const l = s.createElement("div");
    l.className = "popout-container";
    const h = s.createElement("div");
    h.className = "popout-header", h.innerHTML = `
      <button class="popout-header-btn back-btn" title="リストに戻る" style="display:${this._selectedLabel ? "" : "none"};">←</button>
      <span class="popout-header-title">Framebuffer Viewer</span>
      <button class="popout-header-btn dock-btn" title="元に戻す">↙</button>
    `;
    const a = s.createElement("div");
    if (a.className = "popout-grid", this._selectedLabel && a.classList.add("single-view"), l.appendChild(h), l.appendChild(a), s.body.appendChild(l), a.appendChild(this._gridEl), this._selectedLabel) {
      const c = this.getItem(this._selectedLabel);
      c && c.classList.add("selected");
    }
    this._panelEl.style.display = "none";
    const o = s.querySelector(".back-btn"), d = s.querySelector(".dock-btn");
    o == null || o.addEventListener("click", () => {
      this.deselectItem(), o.style.display = "none", a.classList.remove("single-view");
    }), d == null || d.addEventListener("click", () => {
      this._closePopout();
    }), a.addEventListener("click", (c) => {
      const _ = c.composedPath();
      let f = null;
      for (const m of _)
        if (m instanceof HTMLElement && m.tagName.toLowerCase() === "fbv-thumbnail") {
          f = m;
          break;
        }
      if (!f) return;
      const p = f.dataset.label;
      p && (this._selectedLabel === p ? (this.deselectItem(), o.style.display = "none", a.classList.remove("single-view")) : (this.selectItem(p), o.style.display = "", a.classList.add("single-view")));
    }), s.addEventListener("keydown", (c) => {
      c.key === "Escape" && this._selectedLabel !== null && (this.deselectItem(), o.style.display = "none", a.classList.remove("single-view"));
    });
    const b = () => {
      if (!this._popoutWindow || this._popoutWindow.closed) return;
      const c = 36, _ = this._popoutWindow.innerWidth, f = this._popoutWindow.innerHeight - c, p = M(_, f, this.items.length);
      a.style.gridTemplateColumns = `repeat(${p.cols}, 1fr)`, a.style.gridTemplateRows = `repeat(${p.rows}, 1fr)`;
    };
    this._popoutWindow.addEventListener("resize", b), b(), this._popoutCheckInterval = window.setInterval(() => {
      this._popoutWindow && this._popoutWindow.closed && this._onPopoutClosed(a);
    }, 200);
  }
  _onPopoutClosed(t) {
    this._popoutCheckInterval && (clearInterval(this._popoutCheckInterval), this._popoutCheckInterval = null), t.contains(this._gridEl) && this._panelEl.insertBefore(this._gridEl, this._panelEl.querySelector(".fbv-resize")), this._panelEl.style.display = "", this._popoutWindow = null, this._backBtn.style.display = this._selectedLabel ? "" : "none", this._selectedLabel && this._gridEl.classList.add("single-view"), this._updateGridColumns();
  }
  _closePopout() {
    if (this._popoutWindow && !this._popoutWindow.closed) {
      const t = this._popoutWindow.document.querySelector(".popout-grid");
      this._popoutWindow.close(), t && this._onPopoutClosed(t);
    }
  }
}
customElements.get("fbv-panel") || customElements.define("fbv-panel", P);
class $ {
  constructor(t = "top-right") {
    this._panel = null, this._corner = t;
  }
  mount() {
    this._panel || (this._panel = document.createElement("fbv-panel"), this._panel.corner = this._corner, document.body.appendChild(this._panel));
  }
  unmount() {
    this._panel && (this._panel.remove(), this._panel = null);
  }
  addItem(t) {
    if (!this._panel)
      throw new Error("[BufferViewer] Not mounted yet.");
    const e = this._panel.getItem(t);
    return e || this._panel.addThumbnail(t);
  }
  removeItem(t) {
    this._panel && this._panel.removeThumbnail(t);
  }
  getItem(t) {
    var e;
    return (e = this._panel) == null ? void 0 : e.getItem(t);
  }
  get items() {
    return this._panel ? this._panel.items.values() : [].values();
  }
  dispose() {
    this.unmount();
  }
}
const u = class u {
  constructor(t = {}) {
    this._slots = /* @__PURE__ */ new Map(), this._disposed = !1, this._fps = t.fps ?? 10, this._overlay = new $(t.corner ?? "top-right"), this._active = !1, t.active !== !1 && (this.active = !0);
  }
  static getInstance(t) {
    return u._instance || (u._instance = new u(t)), u._instance;
  }
  get active() {
    return this._active;
  }
  set active(t) {
    this._disposed || (this._active = t, t ? this._overlay.mount() : this._overlay.unmount());
  }
  toggle() {
    this.active = !this._active;
  }
  setFps(t) {
    this._fps = t;
    for (const e of this._slots.values())
      e.scheduler.setFps(t);
  }
  /**
   * Capture and display pixel data under the given label.
   * The getData callback is only invoked when the FPS throttle allows.
   * It should return { data, width, height } with RGBA pixel data.
   *
   * Call this at any point in your render pipeline.
   * The panel is auto-created on first use for each label.
   */
  capture(t, e, i) {
    if (!this._active || this._disposed) return;
    const n = this._getOrCreateSlot(t), s = performance.now();
    if (!n.scheduler.shouldCapture(s)) return;
    const l = e(), h = l.width ?? n.panel.lastWidth, a = l.height ?? n.panel.lastHeight;
    if (!h || !a)
      throw new Error(
        `[BufferViewer] "${t}": width/height required on first capture`
      );
    n.panel.updateImage(l.data, h, a, l.flipY ?? !0, i);
  }
  removeBuffer(t) {
    this._slots.has(t) && (this._overlay.removeItem(t), this._slots.delete(t));
  }
  dispose() {
    this._disposed = !0, this._active = !1, this._slots.clear(), this._overlay.dispose(), u._instance = null;
  }
  _getOrCreateSlot(t) {
    let e = this._slots.get(t);
    return e || (e = {
      scheduler: new C(this._fps),
      panel: this._overlay.addItem(t)
    }, this._slots.set(t, e)), e;
  }
};
u._instance = null;
let R = u;
function A(r, t) {
  const e = t.width, i = t.height, n = new Uint8Array(e * i * 4);
  return r.readRenderTargetPixels(t, 0, 0, e, i, n), { data: n, width: e, height: i };
}
function D(r, t) {
  const e = r.getParameter(r.FRAMEBUFFER_BINDING);
  t !== void 0 && r.bindFramebuffer(r.FRAMEBUFFER, t);
  const i = r.drawingBufferWidth, n = r.drawingBufferHeight, s = new Uint8Array(i * n * 4);
  return r.readPixels(0, 0, i, n, r.RGBA, r.UNSIGNED_BYTE, s), t !== void 0 && r.bindFramebuffer(r.FRAMEBUFFER, e), { data: s, width: i, height: n };
}
function q(r) {
  let t;
  r instanceof HTMLCanvasElement || r instanceof OffscreenCanvas ? t = r.getContext("2d") : t = r;
  const e = t.canvas.width, i = t.canvas.height, n = t.getImageData(0, 0, e, i);
  return { data: new Uint8Array(n.data.buffer), width: e, height: i, flipY: !1 };
}
export {
  R as BufferViewer,
  q as readCanvas,
  D as readPixels,
  A as readRenderTarget
};
