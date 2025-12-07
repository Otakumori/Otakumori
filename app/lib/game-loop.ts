export interface GameLoopOptions {
  targetFPS?: number;
  maxFrameSkip?: number;
  onUpdate?: (deltaTime: number) => void;
  onRender?: (alpha: number) => void;
  onError?: (error: Error) => void;
  }

export interface GameLoopStats {
  fps: number;
  frameTime: number;
  updateTime: number;
  renderTime: number;
  frameCount: number;
  lastFrameTime: number;
  }

export class GameLoop {
  private isRunning = false;
  private lastTime = 0;
  private accumulator = 0;
  private targetFPS: number;
  private targetFrameTime: number;
  private maxFrameSkip: number;
  private onUpdate?: (deltaTime: number) => void;
  private onRender?: (alpha: number) => void;
  private onError?: (error: Error) => void;
  private animationFrameId: number | null = null;
  private stats: GameLoopStats = {
    fps: 0,
    frameTime: 0,
    updateTime: 0,
    renderTime: 0,
    frameCount: 0,
    lastFrameTime: 0,
  };

  constructor(options: GameLoopOptions = {}) {
    this.targetFPS = options.targetFPS ?? 60;
    this.targetFrameTime = 1000 / this.targetFPS;
    this.maxFrameSkip = options.maxFrameSkip ?? 5;
    if (options.onUpdate) this.onUpdate = options.onUpdate;
    if (options.onRender) this.onRender = options.onRender;
    if (options.onError) this.onError = options.onError;
  }

  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.stats = {
      fps: 0,
      frameTime: 0,
      updateTime: 0,
      renderTime: 0,
      frameCount: 0,
      lastFrameTime: this.lastTime,
    };

    this.loop();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop(): void {
    if (!this.isRunning) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = Math.min(
      currentTime - this.lastTime,
      this.targetFrameTime * this.maxFrameSkip,
    );
    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    this.stats.frameTime = deltaTime;
    this.stats.lastFrameTime = currentTime;
    this.stats.frameCount += 1;

    if (this.stats.frameCount % 60 === 0) {
      this.stats.fps = 1000 / Math.max(this.stats.frameTime, 1);
    }

    const updateStart = performance.now();
    while (this.accumulator >= this.targetFrameTime) {
      try {
        this.onUpdate?.(this.targetFrameTime);
      } catch (error) {
        this.handleError(error);
      }
      this.accumulator -= this.targetFrameTime;
    }
    this.stats.updateTime = performance.now() - updateStart;

    const renderStart = performance.now();
    try {
      if (this.onRender) {
        const alpha = this.accumulator / this.targetFrameTime;
        this.onRender(alpha);
      }
    } catch (error) {
      this.handleError(error);
    }
    this.stats.renderTime = performance.now() - renderStart;

    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  private handleError(error: unknown) {
    if (error instanceof Error) {
      this.onError?.(error);
    } else {
      this.onError?.(new Error(String(error)));
    }
  }

  isGameRunning(): boolean {
    return this.isRunning;
  }

  getStats(): GameLoopStats {
    return { ...this.stats };
  }

  setTargetFPS(fps: number): void {
    this.targetFPS = Math.min(Math.max(1, fps), 120);
    this.targetFrameTime = 1000 / this.targetFPS;
  }

  getTargetFPS(): number {
    return this.targetFPS;
  }

  getTime(): number {
    return performance.now();
  }

  getDeltaTime(): number {
    return this.targetFrameTime;
  }

  pause(): void {
    if (this.isRunning) {
      this.stop();
    }
  }

  resume(): void {
    if (!this.isRunning) {
      this.start();
    }
  }

  dispose(): void {
    this.stop();
    // Reset callbacks - they can be null/undefined
    this.onUpdate = undefined as any;
    this.onRender = undefined as any;
    this.onError = undefined as any;
  }
}

export const createGameLoop = (options: GameLoopOptions = {}) => new GameLoop(options);

export const defaultGameLoop = new GameLoop();
