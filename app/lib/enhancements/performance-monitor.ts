/**
 * Performance Monitor
 *
 * Real-time performance monitoring and metrics collection
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number; // ms
  memoryUsage?: number; // MB
  drawCalls?: number;
  particleCount?: number;
}

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private readonly historySize = 60; // Keep last 60 frames

  private metrics: PerformanceMetrics = {
    fps: 60,
    frameTime: 16.67,
  };

  private callbacks: Set<(metrics: PerformanceMetrics) => void> = new Set();

  /**
   * Update performance metrics
   */
  update(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Calculate FPS
    const fps = 1000 / deltaTime;
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.historySize) {
      this.fpsHistory.shift();
    }

    // Calculate average FPS
    const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;

    // Frame time
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > this.historySize) {
      this.frameTimeHistory.shift();
    }

    const avgFrameTime =
      this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;

    // Update metrics
    this.metrics = {
      ...this.metrics,
      fps: Math.round(avgFps),
      frameTime: Math.round(avgFrameTime * 100) / 100,
    };

    // Notify callbacks
    this.callbacks.forEach((callback) => callback(this.metrics));
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Subscribe to metrics updates
   */
  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Update additional metrics
   */
  updateMetrics(updates: Partial<PerformanceMetrics>): void {
    this.metrics = { ...this.metrics, ...updates };
    this.callbacks.forEach((callback) => callback(this.metrics));
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    const { fps, frameTime } = this.metrics;

    // FPS score (target: 60fps)
    const fpsScore = Math.min((fps / 60) * 50, 50);

    // Frame time score (target: <16.67ms)
    const frameTimeScore = Math.max(0, 50 - (frameTime - 16.67) * 2);

    return Math.round(fpsScore + frameTimeScore);
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(): boolean {
    return this.metrics.fps >= 45 && this.metrics.frameTime <= 25;
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
    this.frameTimeHistory = [];
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
    };
  }
}

// Singleton instance
let performanceMonitorInstance: PerformanceMonitor | null = null;

/**
 * Get global performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor();
  }
  return performanceMonitorInstance;
}
