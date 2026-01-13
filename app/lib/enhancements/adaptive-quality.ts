/**
 * Adaptive Quality System
 *
 * Automatically adjusts quality settings based on performance
 */

import { type PerformanceMetrics } from './performance-monitor';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}
import { QUALITY_PRESETS, type QualitySettings } from './character-creator';

export interface AdaptiveQualityConfig {
  targetFPS: number;
  minFPS: number;
  adjustmentInterval: number; // ms
  qualitySteps: ('low' | 'medium' | 'high' | 'ultra')[];
}

const DEFAULT_CONFIG: AdaptiveQualityConfig = {
  targetFPS: 60,
  minFPS: 45,
  adjustmentInterval: 2000, // Adjust every 2 seconds
  qualitySteps: ['ultra', 'high', 'medium', 'low'],
};

export class AdaptiveQualitySystem {
  private config: AdaptiveQualityConfig;
  private currentQualityIndex = 0;
  private lastAdjustmentTime = 0;
  private performanceHistory: PerformanceMetrics[] = [];
  private readonly historySize = 10;

  constructor(config: Partial<AdaptiveQualityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get current quality settings
   */
  getCurrentQuality(): QualitySettings {
    const qualityName = this.config.qualitySteps[this.currentQualityIndex] || 'medium';
    return QUALITY_PRESETS[qualityName];
  }

  /**
   * Update quality based on performance
   */
  update(metrics: PerformanceMetrics): QualitySettings {
    const now = performance.now();

    // Add to history
    this.performanceHistory.push(metrics);
    if (this.performanceHistory.length > this.historySize) {
      this.performanceHistory.shift();
    }

    // Only adjust at intervals
    if (now - this.lastAdjustmentTime < this.config.adjustmentInterval) {
      return this.getCurrentQuality();
    }

    this.lastAdjustmentTime = now;

    // Calculate average FPS from history
    const avgFPS =
      this.performanceHistory.reduce((sum, m) => sum + m.fps, 0) / this.performanceHistory.length;

    // Adjust quality based on performance
    if (avgFPS < this.config.minFPS && this.currentQualityIndex < this.config.qualitySteps.length - 1) {
      // Performance is poor, lower quality
      this.currentQualityIndex++;
      getLogger().then((logger) => {
        logger.info(
          `[AdaptiveQuality] Lowering quality to ${this.config.qualitySteps[this.currentQualityIndex]} (FPS: ${avgFPS.toFixed(1)})`,
        );
      });
    } else if (
      avgFPS >= this.config.targetFPS &&
      this.currentQualityIndex > 0 &&
      this.performanceHistory.length >= this.historySize
    ) {
      // Performance is good, try increasing quality
      this.currentQualityIndex--;
      getLogger().then((logger) => {
        logger.info(
          `[AdaptiveQuality] Increasing quality to ${this.config.qualitySteps[this.currentQualityIndex]} (FPS: ${avgFPS.toFixed(1)})`,
        );
      });
    }

    return this.getCurrentQuality();
  }

  /**
   * Force quality level
   */
  setQuality(quality: 'low' | 'medium' | 'high' | 'ultra'): void {
    const index = this.config.qualitySteps.indexOf(quality);
    if (index !== -1) {
      this.currentQualityIndex = index;
    }
  }

  /**
   * Reset to default quality
   */
  reset(): void {
    this.currentQualityIndex = 0;
    this.lastAdjustmentTime = 0;
    this.performanceHistory = [];
  }
}

// Singleton instance
let adaptiveQualityInstance: AdaptiveQualitySystem | null = null;

/**
 * Get global adaptive quality system instance
 */
export function getAdaptiveQualitySystem(): AdaptiveQualitySystem {
  if (!adaptiveQualityInstance) {
    adaptiveQualityInstance = new AdaptiveQualitySystem();
  }
  return adaptiveQualityInstance;
}
