# Canvas Buffer Viewer
[![npm version](https://img.shields.io/badge/dynamic/json?color=blue&label=npm&prefix=v&query=version&suffix=%20&url=https%3A%2F%2Fraw.githubusercontent.com%2Fcraf-te%2Fcanvas-buffer-viewer%2Fmain%2Fpackage.json)](https://www.npmjs.com/package/@craf-te/canvas-buffer-viewer)

WebGLフレームバッファ、レンダーターゲット、Canvas2Dの内容をリアルタイムで可視化する軽量デバッグツールです。複雑なレンダリングパイプラインやポストプロセスエフェクトのデバッグに最適です。

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 特徴

- フレームバッファとレンダーターゲットをサムネイルオーバーレイとして**リアルタイム表示**
- パフォーマンスへの影響を最小限に抑える**FPSスロットリング**
- **マルチフレームワーク対応**: Three.js、生WebGL、Canvas2D
- WebGLの下から上へのピクセル順序を**自動フリップ処理**
- **カスタマイズ可能な配置位置**（左上、右上、左下、右下）
- **依存関係なし** - Three.jsはオプションでヘルパー使用時のみ必要
- **Web Components ベース** - Shadow DOMによるカプセル化されたUI

## インストール

```bash
npm i @craf-te/canvas-buffer-viewer
```

## クイックスタート

### 基本的な使い方

```typescript
import { BufferViewer } from 'canvas-buffer-viewer';

// シングルトンインスタンスを取得
const viewer = BufferViewer.getInstance({
  fps: 10,           // キャプチャレート（デフォルト: 10）
  corner: 'top-right', // 表示位置（デフォルト: 'top-right'）
  active: true       // 起動時にアクティブ（デフォルト: true）
});

// レンダーループ内でバッファをキャプチャ
viewer.capture('My Buffer', () => ({
  data: pixelData,    // RGBA ピクセルの Uint8Array
  width: 512,
  height: 512,
  flipY: true         // WebGLはtrue（デフォルト）、Canvas2Dはfalse
}));
```

### Three.js との連携

```typescript
import { BufferViewer, readRenderTarget } from 'canvas-buffer-viewer';
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();
const renderTarget = new THREE.WebGLRenderTarget(512, 512);
const viewer = BufferViewer.getInstance({ fps: 20 });

function animate() {
  // ターゲットにレンダリング
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera);

  // 可視化用にキャプチャ
  viewer.capture('Scene RT', () => readRenderTarget(renderer, renderTarget));

  // 画面にレンダリング
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}
```

### 生 WebGL

```typescript
import { BufferViewer, readPixels } from 'canvas-buffer-viewer';

const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2');
const viewer = BufferViewer.getInstance();

function render() {
  // ... WebGL レンダリングコード ...

  // 現在のフレームバッファをキャプチャ
  viewer.capture('Main FB', () => readPixels(gl));

  // または特定のフレームバッファをキャプチャ
  viewer.capture('Shadow Map', () => readPixels(gl, shadowFramebuffer));

  requestAnimationFrame(render);
}
```

### Canvas2D

```typescript
import { BufferViewer, readCanvas } from 'canvas-buffer-viewer';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const viewer = BufferViewer.getInstance();

function render() {
  // ... Canvas2D 描画コード ...

  // キャンバスの内容をキャプチャ
  viewer.capture('2D Canvas', () => readCanvas(canvas));
  // またはコンテキストを直接渡す
  viewer.capture('2D Canvas', () => readCanvas(ctx));

  requestAnimationFrame(render);
}
```

## API リファレンス

### `BufferViewer`

バッファ可視化を管理するメインクラス。シングルトンパターンを使用。

#### `BufferViewer.getInstance(options?)`

シングルトンインスタンスを返す。必要に応じて作成。

```typescript
interface ViewerOptions {
  active?: boolean;   // 起動時にアクティブ（デフォルト: true）
  fps?: number;       // キャプチャレート制限（デフォルト: 10）
  corner?: Corner;    // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}
```

#### `viewer.capture(label, getData, note?)`

バッファデータをキャプチャして表示。

- `label`: このバッファスロットの一意の識別子
- `getData`: `CaptureData` を返すコールバック（FPSスロットルが許可した時のみ呼び出される）
- `note`: ラベルの下に表示されるオプションの説明テキスト

```typescript
interface CaptureData {
  data: Uint8Array;   // RGBA ピクセルデータ
  width?: number;     // 初回キャプチャ時は必須
  height?: number;    // 初回キャプチャ時は必須
  flipY?: boolean;    // WebGLはtrue（デフォルト）、Canvas2Dはfalse
}
```

#### `viewer.active`

アクティブ状態の取得・設定。非アクティブ時はキャプチャがスキップされ、オーバーレイが非表示になる。

```typescript
viewer.active = false; // ビューアを非表示
viewer.active = true;  // ビューアを表示
```

#### `viewer.toggle()`

ビューアのオン/オフを切り替え。

#### `viewer.setFps(fps)`

キャプチャレート制限を変更。

#### `viewer.removeBuffer(label)`

特定のバッファを表示から削除。

#### `viewer.dispose()`

全リソースをクリーンアップしてオーバーレイを削除。

### ヘルパー関数

#### `readRenderTarget(renderer, renderTarget)`

Three.js の `WebGLRenderTarget` からピクセルを読み取る。

```typescript
import { readRenderTarget } from 'canvas-buffer-viewer';

viewer.capture('RT', () => readRenderTarget(renderer, myRenderTarget));
```

#### `readPixels(gl, framebuffer?)`

WebGL コンテキストからピクセルを読み取る。`framebuffer` を省略すると現在のバインディングから読み取る。

```typescript
import { readPixels } from 'canvas-buffer-viewer';

// 現在のフレームバッファから読み取り
viewer.capture('Current', () => readPixels(gl));

// 特定のフレームバッファから読み取り
viewer.capture('Shadow', () => readPixels(gl, shadowFBO));
```

#### `readCanvas(source)`

Canvas2D コンテキストまたはキャンバス要素からピクセルを読み取る。

```typescript
import { readCanvas } from 'canvas-buffer-viewer';

viewer.capture('Canvas', () => readCanvas(canvas));
viewer.capture('Canvas', () => readCanvas(ctx));
```

## ポストプロセスパイプラインのデバッグ

マルチパスレンダリングのデバッグは一般的なユースケースです:

```typescript
import { BufferViewer, readRenderTarget } from 'canvas-buffer-viewer';

const viewer = BufferViewer.getInstance({ fps: 15 });

function render() {
  // パス1: シーン
  renderer.setRenderTarget(sceneRT);
  renderer.render(scene, camera);
  viewer.capture('Scene', () => readRenderTarget(renderer, sceneRT), 'ベースシーンレンダー');

  // パス2: ブルームしきい値
  renderer.setRenderTarget(bloomRT);
  renderer.render(bloomScene, postCamera);
  viewer.capture('Bloom', () => readRenderTarget(renderer, bloomRT), '明部抽出');

  // パス3: ブラー
  renderer.setRenderTarget(blurRT);
  renderer.render(blurScene, postCamera);
  viewer.capture('Blur', () => readRenderTarget(renderer, blurRT));

  // 最終合成
  renderer.setRenderTarget(null);
  renderer.render(compositeScene, postCamera);

  requestAnimationFrame(render);
}
```

## キーボードショートカットの例

便利なトグルショートカットを追加:

```typescript
const viewer = BufferViewer.getInstance({ active: false });

window.addEventListener('keydown', (e) => {
  if (e.key === 'F2') {
    viewer.toggle();
  }
});
```

## ライセンス

MIT
