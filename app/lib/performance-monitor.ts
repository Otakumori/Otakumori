/**
 * Performance Monitor
 *
 * Tracks and reports performance metrics including FPS, memory usage,
 * and rendering performance.
 */

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  frameDrops: number;
  timestamp: number;

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics: number = 100;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  private currentFps: number = 0;
  private frameDrops: number = 0;
  private isMonitoring: boolean = false;
  private rafId: number | null = null;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start monitoring performance
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.lastFpsUpdate = performance.now();
    this.frameCount = 0;
    this.frameDrops = 0;

    this.rafId = requestAnimationFrame(this.monitor.bind(this));
  }

  /**
   * Stop monitoring performance
   */
  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Monitor performance in animation frame
   */
  private monitor(currentTime: number): void {
    if (!this.isMonitoring) return;

    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    this.frameCount++;

    // Check for frame drops (frames taking longer than 16.67ms at 60fps)
    if (deltaTime > 16.67) {
      this.frameDrops++;
    }

    // Update FPS every second
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;

      // Record metrics
      this.recordMetrics({
        fps: this.currentFps,
        memoryUsage: this.getMemoryUsage(),
        renderTime: deltaTime,
        frameDrops: this.frameDrops,
        timestamp: currentTime,
      });

      // Reset frame drops counter
      this.frameDrops = 0;
    }

    this.rafId = requestAnimationFrame(this.monitor.bind(this));
  }

  /**
   * Record performance metrics
   */
  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * Get current FPS
   */
  getCurrentFps(): number {
    return this.currentFps;
  }

  /**
   * Get average FPS over time
   */
  getAverageFps(): number {
    if (this.metrics.length === 0) return 0;

    const totalFps = this.metrics.reduce((sum, metric) => sum + metric.fps, 0);
    return totalFps / this.metrics.length;
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    currentFps: number;
    averageFps: number;
    averageMemoryUsage: number;
    averageRenderTime: number;
    totalFrameDrops: number;
    isMonitoring: boolean;
  } {
    const averageMemoryUsage =
      this.metrics.length > 0
        ? this.metrics.reduce((sum, metric) => sum + metric.memoryUsage, 0) / this.metrics.length
        : 0;

    const averageRenderTime =
      this.metrics.length > 0
        ? this.metrics.reduce((sum, metric) => sum + metric.renderTime, 0) / this.metrics.length
        : 0;

    const totalFrameDrops = this.metrics.reduce((sum, metric) => sum + metric.frameDrops, 0);

    return {
      currentFps: this.currentFps,
      averageFps: this.getAverageFps(),
      averageMemoryUsage,
      averageRenderTime,
      totalFrameDrops,
      isMonitoring: this.isMonitoring,
    };
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count: number = 10): PerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Check if performance is good
   */
  isPerformanceGood(): boolean {
    const stats = this.getStats();
    return stats.averageFps >= 50 && stats.averageRenderTime <= 20;
  }

  /**
   * Get performance warnings
   */
  getWarnings(): string[] {
    const warnings: string[] = [];
    const stats = this.getStats();

    if (stats.averageFps < 30) {
      warnings.push('Low FPS detected');
    }

    if (stats.averageRenderTime > 33) {
      warnings.push('High render time detected');
    }

    if (stats.totalFrameDrops > 10) {
      warnings.push('Multiple frame drops detected');
    }

    if (stats.averageMemoryUsage > 100) {
      warnings.push('High memory usage detected');
    }

    return warnings;
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
