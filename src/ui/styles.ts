export const hostStyles = /* css */ `
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
`;

export const thumbnailStyles = /* css */ `
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
`;
