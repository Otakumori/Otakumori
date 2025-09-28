export interface EngineCallbacks {
  update: (deltaTime: number) => void;
  render: () => void;
}

export class Engine {
  private callbacks: EngineCallbacks;
  private animationId: number | null = null;
  private lastTime = 0;
  private isRunning = false;

  constructor(callbacks: EngineCallbacks) {
    this.callbacks = callbacks;
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 50); // Clamp to 50ms max
    this.lastTime = currentTime;

    try {
      this.callbacks.update(deltaTime);
      this.callbacks.render();
    } catch (error) {
      console.error('Engine error:', error);
      this.stop();
      return;
    }

    this.animationId = requestAnimationFrame(this.tick);
  };

  get running(): boolean {
    return this.isRunning;
  }
}

// Utility function to create a simple engine
export function createEngine(callbacks: EngineCallbacks): Engine {
  return new Engine(callbacks);
}
