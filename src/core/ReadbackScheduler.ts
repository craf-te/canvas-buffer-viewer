export class ReadbackScheduler {
  private _interval: number;
  private _lastCapture = 0;

  constructor(fps: number = 10) {
    this._interval = 1000 / fps;
  }

  setFps(fps: number): void {
    this._interval = 1000 / fps;
  }

  shouldCapture(now: number): boolean {
    if (now - this._lastCapture < this._interval) return false;
    this._lastCapture = now;
    return true;
  }
}
