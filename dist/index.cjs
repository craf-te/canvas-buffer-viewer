"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});class k{constructor(t=10){this._lastCapture=0,this._interval=1e3/t}setFps(t){this._interval=1e3/t}shouldCapture(t){return t-this._lastCapture<this._interval?!1:(this._lastCapture=t,!0)}}const I=`
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
`,T=`
  :host {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    font-family: monospace;
    color: #fff;
    cursor: pointer;
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
`;class C extends HTMLElement{constructor(){super(),this._label="",this._lastWidth=0,this._lastHeight=0,this._lastNote=void 0,this.attachShadow({mode:"open"})}connectedCallback(){this._render()}set label(t){this._label=t,this._labelEl&&this._updateLabelText()}get label(){return this._label}get lastWidth(){return this._lastWidth}get lastHeight(){return this._lastHeight}_render(){this.shadowRoot&&(this.shadowRoot.innerHTML=`
      <style>${T}</style>
      <div class="fbv-buffer-header">
        <div class="fbv-buffer-label"></div>
        <div class="fbv-buffer-note" style="display: none;">
          <span class="fbv-buffer-note-text"></span>
        </div>
      </div>
      <canvas></canvas>
    `,this._labelEl=this.shadowRoot.querySelector(".fbv-buffer-label"),this._noteEl=this.shadowRoot.querySelector(".fbv-buffer-note"),this._noteTextEl=this.shadowRoot.querySelector(".fbv-buffer-note-text"),this.canvas=this.shadowRoot.querySelector("canvas"),this.ctx=this.canvas.getContext("2d"),this._updateLabelText())}_updateLabelText(){this._lastWidth>0&&this._lastHeight>0?this._labelEl.textContent=`${this._label} (${this._lastWidth}x${this._lastHeight})`:this._labelEl.textContent=this._label}updateImage(t,e,i,s=!0,n){if(!this.canvas)return;(this.canvas.width!==e||this.canvas.height!==i)&&(this.canvas.width=e,this.canvas.height=i),(this._lastWidth!==e||this._lastHeight!==i)&&(this._lastWidth=e,this._lastHeight=i,this._updateLabelText()),this._lastNote!==n&&(this._lastNote=n,n?(this._noteEl.style.display="block",this._noteTextEl.textContent=n,this._noteEl.title=n,this._noteTextEl.style.animation="none",this._noteTextEl.offsetWidth,this._noteTextEl.style.animation=""):(this._noteEl.style.display="none",this._noteTextEl.textContent="",this._noteEl.title=""));const o=this.ctx.createImageData(e,i);if(s)for(let r=0;r<i;r++){const d=(i-1-r)*e*4,l=r*e*4;o.data.set(t.subarray(d,d+e*4),l)}else o.data.set(t);this.ctx.putImageData(o,0,0)}dispose(){this.remove()}}customElements.get("fbv-thumbnail")||customElements.define("fbv-thumbnail",C);const M="fbv-state",f=420,u=240,v=12,B=4,g=4,A=22;function H(a,t,e){if(e<=0)return{cols:1,rows:1,cellArea:0};if(e===1){const o=a-g*2,r=t-g*2;return{cols:1,rows:1,cellArea:o*r}}const i=a-g*2,s=t-g*2;let n={cols:1,rows:e,cellArea:0};for(let o=1;o<=e;o++){const r=Math.ceil(e/o),d=(i-B*(o-1))/o,l=(s-B*(r-1))/r;if(d<60||l<40)continue;const h=d*l;h>n.cellArea&&(n={cols:o,rows:r,cellArea:h})}return n}class $ extends HTMLElement{constructor(){super(),this._corner="top-right",this._initialPosSet=!1,this._preMaxState=null,this._selectedLabel=null,this._resizeObserver=null,this.attachShadow({mode:"open"}),this._state=this._loadState(),this._boundEscHandler=t=>{t.key==="Escape"&&(this._selectedLabel!==null?this.deselectItem():this._state.maximized&&this._toggleMaximize(!1))}}connectedCallback(){this._render(),this._applyBottomAttribute(),this._applyState(),document.addEventListener("keydown",this._boundEscHandler),this._initResizeObserver()}disconnectedCallback(){var t;document.removeEventListener("keydown",this._boundEscHandler),(t=this._resizeObserver)==null||t.disconnect(),this._resizeObserver=null}set corner(t){this._corner=t,this._applyBottomAttribute(),!this._initialPosSet&&this._state.top===null&&this._state.left===null&&this._applyDefaultCornerPos()}_applyBottomAttribute(){this._corner.indexOf("bottom")>=0?this.setAttribute("bottom",""):this.removeAttribute("bottom")}_render(){if(!this.shadowRoot)return;this.shadowRoot.innerHTML=`
      <style>${I}</style>
      <div class="fbv-panel">
        <div class="fbv-header">
          <button class="fbv-header-btn back-btn" title="リストに戻る" style="display:none;">←</button>
          <span class="fbv-header-title">Framebuffer Viewer</span>
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
    `,this._panelEl=this.shadowRoot.querySelector(".fbv-panel"),this._gridEl=this.shadowRoot.querySelector(".fbv-grid"),this._minimizeBtn=this.shadowRoot.querySelector(".minimize-btn"),this._restoreBtn=this.shadowRoot.querySelector(".restore-btn"),this._maximizeBtn=this.shadowRoot.querySelector(".maximize-btn"),this._unmaximizeBtn=this.shadowRoot.querySelector(".unmaximize-btn"),this._backBtn=this.shadowRoot.querySelector(".back-btn");const t=this.shadowRoot.querySelector(".fbv-header"),e=this.shadowRoot.querySelector(".reset-btn");this._initDrag(t),this._initResize(),this._minimizeBtn.addEventListener("click",i=>{i.stopPropagation(),this._toggleMinimize(!0)}),this._restoreBtn.addEventListener("click",i=>{i.stopPropagation(),this._toggleMinimize(!1)}),this._maximizeBtn.addEventListener("click",i=>{i.stopPropagation(),this._toggleMaximize(!0)}),this._unmaximizeBtn.addEventListener("click",i=>{i.stopPropagation(),this._toggleMaximize(!1)}),e.addEventListener("click",i=>{i.stopPropagation(),this._resetState()}),this._backBtn.addEventListener("click",i=>{i.stopPropagation(),this.deselectItem()}),this._gridEl.addEventListener("click",i=>{const s=i.target.closest("fbv-thumbnail");if(!s)return;const n=s.dataset.label;n&&(this._selectedLabel===n?this.deselectItem():this.selectItem(n))})}addThumbnail(t){const e=document.createElement("fbv-thumbnail");return e.label=t,e.dataset.label=t,this._gridEl.appendChild(e),this._updateGridColumns(),this._selectedLabel===t&&this.selectItem(t),e}removeThumbnail(t){const e=this._gridEl.querySelector(`fbv-thumbnail[data-label="${t}"]`);e&&(this._selectedLabel===t&&this.deselectItem(),e.remove(),this._updateGridColumns())}get items(){return this._gridEl?Array.from(this._gridEl.querySelectorAll("fbv-thumbnail")):[]}getItem(t){return this.items.find(e=>e.label===t)}dispose(){this.remove()}selectItem(t){const e=this.getItem(t);e&&(this.items.forEach(i=>i.classList.remove("selected")),this._selectedLabel=t,e.classList.add("selected"),this._gridEl.classList.add("single-view"),this._backBtn.style.display="",this._state.selectedLabel=t,this._saveState())}deselectItem(){this._selectedLabel=null,this.items.forEach(t=>t.classList.remove("selected")),this._gridEl.classList.remove("single-view"),this._backBtn.style.display="none",this._state.selectedLabel=null,this._saveState()}_updateGridColumns(){if(!this._gridEl||!this._panelEl)return;const t=this._panelEl.clientWidth,e=this._panelEl.clientHeight-A,i=H(t,e,this.items.length);this._gridEl.style.gridTemplateColumns=`repeat(${i.cols}, 1fr)`,this._gridEl.style.gridTemplateRows=`repeat(${i.rows}, 1fr)`}_initResizeObserver(){this._panelEl&&(this._resizeObserver=new ResizeObserver(()=>{this._updateGridColumns()}),this._resizeObserver.observe(this._panelEl))}_loadState(){try{const t=sessionStorage.getItem(M);if(t){const e=JSON.parse(t);return"selectedLabel"in e||(e.selectedLabel=null),e}}catch{}return{width:f,height:u,top:null,left:null,minimized:!1,maximized:!1,selectedLabel:null}}_saveState(){try{sessionStorage.setItem(M,JSON.stringify(this._state))}catch{}}_applyState(){this._state.width&&this._state.height&&(this._panelEl.style.width=`${this._state.width}px`,this._panelEl.style.height=`${this._state.height}px`),this._state.top!==null&&this._state.left!==null?(this._panelEl.style.top=`${this._state.top}px`,this._panelEl.style.left=`${this._state.left}px`,this._initialPosSet=!0):this._applyDefaultCornerPos(),this._toggleMinimize(this._state.minimized,!1),this._toggleMaximize(this._state.maximized,!1),this._selectedLabel=this._state.selectedLabel}_resetState(){this._state={width:f,height:u,top:null,left:null,minimized:!1,maximized:!1,selectedLabel:null},this._initialPosSet=!1,this._preMaxState=null,this.deselectItem(),this._applyDefaultCornerPos(),this._applyState(),this._saveState()}_applyDefaultCornerPos(){if(!this._panelEl)return;this._panelEl.style.width=`${f}px`,this._panelEl.style.height=`${u}px`,this._panelEl.style.right="",this._panelEl.style.bottom="";const t=this._corner.indexOf("top")>=0,e=this._corner.indexOf("left")>=0,i=t?v:window.innerHeight-u-v,s=e?v:window.innerWidth-f-v;this._panelEl.style.top=`${i}px`,this._panelEl.style.left=`${s}px`,this._state.top=i,this._state.left=s,this._state.width=f,this._state.height=u}_toggleMinimize(t,e=!0){this._state.minimized=t,t?(this.setAttribute("minimized",""),this._minimizeBtn.style.display="none",this._restoreBtn.style.display="",this._state.maximized&&this._toggleMaximize(!1,!1)):(this.removeAttribute("minimized"),this._minimizeBtn.style.display="",this._restoreBtn.style.display="none"),e&&this._saveState()}_toggleMaximize(t,e=!0){this._state.maximized=t,t?(this.hasAttribute("maximized")||(this._preMaxState={width:this._state.width,height:this._state.height,top:this._state.top,left:this._state.left}),this.setAttribute("maximized",""),this._maximizeBtn.style.display="none",this._unmaximizeBtn.style.display="",this._state.minimized&&this._toggleMinimize(!1,!1)):(this.removeAttribute("maximized"),this._maximizeBtn.style.display="",this._unmaximizeBtn.style.display="none",this._preMaxState&&(this._state.width=this._preMaxState.width,this._state.height=this._preMaxState.height,this._state.top=this._preMaxState.top,this._state.left=this._preMaxState.left,this._panelEl.style.width=`${this._state.width}px`,this._panelEl.style.height=`${this._state.height}px`,this._panelEl.style.top=`${this._state.top}px`,this._panelEl.style.left=`${this._state.left}px`)),e&&this._saveState()}_initDrag(t){let e=0,i=0,s=0,n=0;const o=l=>{let h=s+(l.clientX-e),b=n+(l.clientY-i);this._panelEl.style.left=`${h}px`,this._panelEl.style.top=`${b}px`},r=()=>{this._panelEl.classList.remove("dragging"),document.removeEventListener("mousemove",o),document.removeEventListener("mouseup",r);const l=this._panelEl.getBoundingClientRect();this._state.left=l.left,this._state.top=l.top,this._saveState()},d=l=>{if(l.target.tagName.toLowerCase()==="button"||this._state.maximized)return;l.preventDefault(),this._panelEl.classList.add("dragging");const h=this._panelEl.getBoundingClientRect();e=l.clientX,i=l.clientY,s=h.left,n=h.top,document.addEventListener("mousemove",o),document.addEventListener("mouseup",r)};t.addEventListener("mousedown",d),this._panelEl.addEventListener("mousedown",l=>{const h=l.target;h.closest(".fbv-grid")||h.closest(".fbv-resize")||h.closest(".fbv-header")||h.closest("fbv-thumbnail")||d(l)})}_initResize(){["tl","tr","bl","br"].forEach(e=>{var s;const i=(s=this.shadowRoot)==null?void 0:s.querySelector(`.fbv-resize-${e}`);i&&i.addEventListener("mousedown",n=>{if(this._state.maximized)return;n.preventDefault(),n.stopPropagation(),this._panelEl.classList.add("resizing");const o=n.clientX,r=n.clientY,d=this._panelEl.getBoundingClientRect(),l=d.width,h=d.height,b=d.top,y=d.left,w=p=>{const z=p.clientX-o,L=p.clientY-r;let _=l,m=h,S=b,R=y;e==="tl"||e==="bl"?(_=Math.max(200,l-z),R=y+(l-_)):_=Math.max(200,l+z),e==="tl"||e==="tr"?(m=Math.max(120,h-L),S=b+(h-m)):m=Math.max(120,h+L),this._panelEl.style.width=`${_}px`,this._panelEl.style.height=`${m}px`,this._panelEl.style.top=`${S}px`,this._panelEl.style.left=`${R}px`},E=()=>{this._panelEl.classList.remove("resizing"),document.removeEventListener("mousemove",w),document.removeEventListener("mouseup",E);const p=this._panelEl.getBoundingClientRect();this._state.width=p.width,this._state.height=p.height,this._state.top=p.top,this._state.left=p.left,this._saveState()};document.addEventListener("mousemove",w),document.addEventListener("mouseup",E)})})}}customElements.get("fbv-panel")||customElements.define("fbv-panel",$);class P{constructor(t="top-right"){this._panel=null,this._corner=t}mount(){this._panel||(this._panel=document.createElement("fbv-panel"),this._panel.corner=this._corner,document.body.appendChild(this._panel))}unmount(){this._panel&&(this._panel.remove(),this._panel=null)}addItem(t){if(!this._panel)throw new Error("[BufferViewer] Not mounted yet.");const e=this._panel.getItem(t);return e||this._panel.addThumbnail(t)}removeItem(t){this._panel&&this._panel.removeThumbnail(t)}getItem(t){var e;return(e=this._panel)==null?void 0:e.getItem(t)}get items(){return this._panel?this._panel.items.values():[].values()}dispose(){this.unmount()}}const c=class c{constructor(t={}){this._slots=new Map,this._disposed=!1,this._fps=t.fps??10,this._overlay=new P(t.corner??"top-right"),this._active=!1,t.active!==!1&&(this.active=!0)}static getInstance(t){return c._instance||(c._instance=new c(t)),c._instance}get active(){return this._active}set active(t){this._disposed||(this._active=t,t?this._overlay.mount():this._overlay.unmount())}toggle(){this.active=!this._active}setFps(t){this._fps=t;for(const e of this._slots.values())e.scheduler.setFps(t)}capture(t,e,i){if(!this._active||this._disposed)return;const s=this._getOrCreateSlot(t),n=performance.now();if(!s.scheduler.shouldCapture(n))return;const o=e(),r=o.width??s.panel.lastWidth,d=o.height??s.panel.lastHeight;if(!r||!d)throw new Error(`[BufferViewer] "${t}": width/height required on first capture`);s.panel.updateImage(o.data,r,d,o.flipY??!0,i)}removeBuffer(t){this._slots.has(t)&&(this._overlay.removeItem(t),this._slots.delete(t))}dispose(){this._disposed=!0,this._active=!1,this._slots.clear(),this._overlay.dispose(),c._instance=null}_getOrCreateSlot(t){let e=this._slots.get(t);return e||(e={scheduler:new k(this._fps),panel:this._overlay.addItem(t)},this._slots.set(t,e)),e}};c._instance=null;let x=c;function D(a,t){const e=t.width,i=t.height,s=new Uint8Array(e*i*4);return a.readRenderTargetPixels(t,0,0,e,i,s),{data:s,width:e,height:i}}function O(a,t){const e=a.getParameter(a.FRAMEBUFFER_BINDING);t!==void 0&&a.bindFramebuffer(a.FRAMEBUFFER,t);const i=a.drawingBufferWidth,s=a.drawingBufferHeight,n=new Uint8Array(i*s*4);return a.readPixels(0,0,i,s,a.RGBA,a.UNSIGNED_BYTE,n),t!==void 0&&a.bindFramebuffer(a.FRAMEBUFFER,e),{data:n,width:i,height:s}}function q(a){let t;a instanceof HTMLCanvasElement||a instanceof OffscreenCanvas?t=a.getContext("2d"):t=a;const e=t.canvas.width,i=t.canvas.height,s=t.getImageData(0,0,e,i);return{data:new Uint8Array(s.data.buffer),width:e,height:i,flipY:!1}}exports.BufferViewer=x;exports.readCanvas=q;exports.readPixels=O;exports.readRenderTarget=D;
