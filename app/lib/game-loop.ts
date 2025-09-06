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
    this.targetFPS = options.targetFPS || 60;
    this.targetFrameTime = 1000 / this.targetFPS;
    this.maxFrameSkip = options.maxFrameSkip || 5;
    this.onUpdate = options.onUpdate;
    this.onRender = options.onRender;
    this.onError = options.onError;
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.stats = {
      fps: 0,
      frameTime: 0,
      updateTime: 0,
      renderTime: 0,
      frameCount: 0,
      lastFrameTime: 0,
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
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = Math.min(
      currentTime - this.lastTime,
      this.targetFrameTime * this.maxFrameSkip,
    );
    this.lastTime = currentTime;

    this.accumulator += deltaTime;

    // Update stats
    this.stats.frameTime = deltaTime;
    this.stats.lastFrameTime = currentTime;
    this.stats.frameCount++;

    // Calculate FPS
    if (this.stats.frameCount % 60 === 0) {
      this.stats.fps = 1000 / (this.stats.frameTime || 1);
    }

    // Fixed timestep updates
    const updateStart = performance.now();
    while (this.accumulator >= this.targetFrameTime) {
      try {
        if (this.onUpdate) {
          this.onUpdate(this.targetFrameTime);
        }
        this.accumulator -= this.targetFrameTime;
      } catch (error) {
        if (this.onError) {
          this.onError(error as Error);
        } else {
          console.error('Game loop update error:', error);
        }
      }
    }
    this.stats.updateTime = performance.now() - updateStart;

    // Render with interpolation
    const renderStart = performance.now();
    try {
      if (this.onRender) {
        const alpha = this.accumulator / this.targetFrameTime;
        this.onRender(alpha);
      }
    } catch (error) {
      if (this.onError) {
        this.onError(error as Error);
      } else {
        console.error('Game loop render error:', error);
      }
    }
    this.stats.renderTime = performance.now() - renderStart;

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  // Public API
  isGameRunning(): boolean {
    return this.isRunning;
  }

  getStats(): GameLoopStats {
    return { ...this.stats };
  }

  setTargetFPS(fps: number): void {
    this.targetFPS = Math.max(1, Math.min(120, fps));
    this.targetFrameTime = 1000 / this.targetFPS;
  }

  getTargetFPS(): number {
    return this.targetFPS;
  }

  // Utility methods for time management
  getTime(): number {
    return performance.now();
  }

  getDeltaTime(): number {
    return this.targetFrameTime;
  }

  // Pause/resume functionality
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

  // Cleanup
  dispose(): void {
    this.stop();
    this.onUpdate = undefined;
    this.onRender = undefined;
    this.onError = undefined;
  }
}

// Export convenience functions
export const createGameLoop = (options: GameLoopOptions) => new GameLoop(options);

// Export a default game loop instance for simple use cases
export const defaultGameLoop = new GameLoop();
