/**
 * Feature Flag Utilities
 *
 * This module provides utility functions for working with feature flags
 * including performance helpers, debugging tools, and integration utilities.
 */

import {
  type FeatureFlagKey,
  type FeatureFlagValue,
  type GameCubeBootFrequency,
  type PerformanceMonitoringLevel,
  type MiniGameDifficulty,
  type ProductRecommendationAlgorithm,
  isGameCubeBootFrequency,
  isPerformanceMonitoringLevel,
} from './types';
import { evaluateFeatureFlag, isFeatureEnabled, getFeatureFlagValue } from './provider';
import { env } from '@/env.mjs';

/**
 * Performance monitoring utilities based on feature flags
 */
export class PerformanceMonitor {
  private static level: PerformanceMonitoringLevel = 'off';

  static async initialize() {
    this.level = (await getFeatureFlagValue(
      'PERFORMANCE_MONITORING_LEVEL',
      'basic',
    )) as PerformanceMonitoringLevel;
  }

  static shouldTrackMetric(metricType: 'basic' | 'advanced' | 'debug'): boolean {
    switch (this.level) {
      case 'off':
        return false;
      case 'basic':
        return metricType === 'basic';
      case 'advanced':
        return metricType === 'basic' || metricType === 'advanced';
      case 'debug':
        return true;
      default:
        return false;
    }
  }

  static track(
    metricName: string,
    value: number,
    metricType: 'basic' | 'advanced' | 'debug' = 'basic',
  ) {
    if (!this.shouldTrackMetric(metricType)) return;

    // Send to analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metricName,
        metric_value: value,
        metric_type: metricType,
      });
    }
  }
}

/**
 * GameCube feature utilities
 */
export class GameCubeFeatures {
  static async shouldShowBootAnimation(): Promise<boolean> {
    const enabled = await isFeatureEnabled('GAMECUBE_BOOT_ANIMATION');
    if (!enabled) return false;

    const frequency = (await getFeatureFlagValue(
      'GAMECUBE_BOOT_FREQUENCY',
      'once_per_day',
    )) as GameCubeBootFrequency;

    switch (frequency) {
      case 'never':
        return false;
      case 'always':
        return true;
      case 'first_visit_only':
        return !localStorage.getItem('otm-gamecube-visited');
      case 'once_per_day':
      default:
        const today = new Date().toISOString().split('T')[0];
        return !localStorage.getItem(`otm-gamecube-boot-${today}`);
    }
  }

  static markBootAnimationShown() {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`otm-gamecube-boot-${today}`, 'true');
    localStorage.setItem('otm-gamecube-visited', 'true');
  }

  static async shouldPlayAudio(): Promise<boolean> {
    return await isFeatureEnabled('GAMECUBE_AUDIO_ENABLED');
  }

  static async shouldRespectReducedMotion(): Promise<boolean> {
    const flagEnabled = await isFeatureEnabled('GAMECUBE_REDUCED_MOTION');
    const userPrefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return flagEnabled && userPrefersReducedMotion;
  }
}

/**
 * Mini-games feature utilities
 */
export class MiniGameFeatures {
  static async isEnabled(): Promise<boolean> {
    return await isFeatureEnabled('MINI_GAMES_ENABLED');
  }

  static async getDifficultyMode(): Promise<MiniGameDifficulty> {
    const adaptive = await isFeatureEnabled('MINI_GAMES_DIFFICULTY_ADAPTIVE');
    if (adaptive) return 'adaptive';

    // Could be configured per user or game
    return 'medium';
  }

  static async shouldShowLeaderboards(): Promise<boolean> {
    return await isFeatureEnabled('MINI_GAMES_LEADERBOARDS');
  }

  static async shouldShowAchievements(): Promise<boolean> {
    return await isFeatureEnabled('MINI_GAMES_ACHIEVEMENTS');
  }

  static async shouldUseCloudSave(): Promise<boolean> {
    return await isFeatureEnabled('MINI_GAMES_SAVE_CLOUD');
  }
}

/**
 * Commerce feature utilities
 */
export class CommerceFeatures {
  static async getRecommendationAlgorithm(): Promise<ProductRecommendationAlgorithm> {
    const aiEnabled = await isFeatureEnabled('PRODUCT_RECOMMENDATIONS_AI');
    if (aiEnabled) return 'ai_enhanced';

    return 'collaborative'; // Default algorithm
  }

  static async shouldUseEnhancedSearch(): Promise<boolean> {
    return await isFeatureEnabled('PRODUCT_SEARCH_ENHANCED');
  }

  static async shouldUseRealTimeInventory(): Promise<boolean> {
    return await isFeatureEnabled('REAL_TIME_INVENTORY');
  }

  static async shouldUseStripeV2(): Promise<boolean> {
    return await isFeatureEnabled('STRIPE_CHECKOUT_V2');
  }

  static async shouldOptimizeWishlistConversion(): Promise<boolean> {
    return await isFeatureEnabled('WISHLIST_TO_CART_OPTIMIZATION');
  }
}

/**
 * Analytics and tracking utilities
 */
export class AnalyticsFeatures {
  static async shouldUseEnhancedGA4(): Promise<boolean> {
    return await isFeatureEnabled('GA4_ENHANCED_TRACKING');
  }

  static async shouldTrackUserBehavior(): Promise<boolean> {
    return await isFeatureEnabled('USER_BEHAVIOR_ANALYTICS');
  }

  static async shouldUseSentryPerformance(): Promise<boolean> {
    return await isFeatureEnabled('SENTRY_PERFORMANCE_MONITORING');
  }

  static async isABTestingEnabled(): Promise<boolean> {
    return await isFeatureEnabled('A_B_TESTING_FRAMEWORK');
  }
}

/**
 * Security feature utilities
 */
export class SecurityFeatures {
  static async shouldUseEnhancedCSRF(): Promise<boolean> {
    return await isFeatureEnabled('CSRF_PROTECTION_ENHANCED');
  }

  static async shouldUseRedisRateLimit(): Promise<boolean> {
    return await isFeatureEnabled('RATE_LIMITING_REDIS');
  }

  static async shouldEnforceGDPR(): Promise<boolean> {
    return await isFeatureEnabled('GDPR_COMPLIANCE_MODE');
  }

  static async shouldUseEnhancedHeaders(): Promise<boolean> {
    return await isFeatureEnabled('SECURITY_HEADERS_V2');
  }
}

/**
 * Development utilities
 */
export class DevelopmentFeatures {
  static async isEnhancedModeEnabled(): Promise<boolean> {
    return await isFeatureEnabled('DEV_MODE_ENHANCED');
  }

  static async shouldShowDebuggingTools(): Promise<boolean> {
    return await isFeatureEnabled('DEBUGGING_TOOLS');
  }

  static async shouldUseEnhancedErrorBoundary(): Promise<boolean> {
    return await isFeatureEnabled('ERROR_BOUNDARY_ENHANCED');
  }
}

/**
 * Feature flag debugging utilities
 */
export class FeatureFlagDebugger {
  static async getAllFlags(): Promise<Record<string, FeatureFlagValue>> {
    const flags: Record<string, FeatureFlagValue> = {};

    // Evaluate all flags for debugging
    const flagKeys: FeatureFlagKey[] = [
      'GAMECUBE_BOOT_ANIMATION',
      'GAMECUBE_BOOT_FREQUENCY',
      'PERFORMANCE_MONITORING_LEVEL',
      'MINI_GAMES_ENABLED',
      'PRINTIFY_INTEGRATION_V2',
      'DARK_GLASS_THEME_V2',
      'GA4_ENHANCED_TRACKING',
      'CSRF_PROTECTION_ENHANCED',
    ];

    for (const key of flagKeys) {
      try {
        flags[key] = await evaluateFeatureFlag(key);
      } catch (error) {
        flags[key] = `Error: ${error instanceof Error ? error.message : 'Unknown'}`;
      }
    }

    return flags;
  }

  static logFlags() {
    if (typeof window === 'undefined' || env.NODE_ENV !== 'development') {
      return;
    }

    this.getAllFlags().then((flags) => {
      // Feature Flags Status
      Object.entries(flags).forEach(([key, value]) => {
        // Feature flag value logged
      });
      // Group end
    });
  }
}

/**
 * Type-safe feature flag getters with validation
 */
export const TypeSafeFlags = {
  async getGameCubeBootFrequency(): Promise<GameCubeBootFrequency> {
    const value = await getFeatureFlagValue('GAMECUBE_BOOT_FREQUENCY', 'once_per_day');
    return isGameCubeBootFrequency(value) ? value : 'once_per_day';
  },

  async getPerformanceMonitoringLevel(): Promise<PerformanceMonitoringLevel> {
    const value = await getFeatureFlagValue('PERFORMANCE_MONITORING_LEVEL', 'basic');
    return isPerformanceMonitoringLevel(value) ? value : 'basic';
  },

  async getMiniGameDifficulty(): Promise<MiniGameDifficulty> {
    const adaptive = await isFeatureEnabled('MINI_GAMES_DIFFICULTY_ADAPTIVE');
    return adaptive ? 'adaptive' : 'medium';
  },

  async getProductRecommendationAlgorithm(): Promise<ProductRecommendationAlgorithm> {
    const aiEnabled = await isFeatureEnabled('PRODUCT_RECOMMENDATIONS_AI');
    return aiEnabled ? 'ai_enhanced' : 'collaborative';
  },
};

/**
 * Feature flag initialization for app startup
 */
export async function initializeFeatureFlags() {
  // Initialize performance monitoring
  await PerformanceMonitor.initialize();

  // Log flags in development
  if (env.NODE_ENV === 'development') {
    FeatureFlagDebugger.logFlags();
  }

  // Track feature flag usage for analytics
  if (await AnalyticsFeatures.shouldUseEnhancedGA4()) {
    const flags = await FeatureFlagDebugger.getAllFlags();

    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'feature_flags_initialized', {
        flag_count: Object.keys(flags).length,
        environment: env.NODE_ENV,
      });
    }
  }
}

/**
 * Feature flag cache warming for SSR
 */
export async function warmFeatureFlagCache(userId?: string, userRole?: string) {
  const context = {
    userId,
    userRole: userRole as 'user' | 'moderator' | 'admin',
    environment: env.NODE_ENV || 'development',
    timestamp: Date.now(),
  };

  // Pre-evaluate critical flags for better SSR performance
  const criticalFlags: FeatureFlagKey[] = [
    'GAMECUBE_BOOT_ANIMATION',
    'MINI_GAMES_ENABLED',
    'DARK_GLASS_THEME_V2',
    'ACCESSIBILITY_ENHANCED_MODE',
  ];

  await Promise.allSettled(criticalFlags.map((flag) => evaluateFeatureFlag(flag, context)));
}
