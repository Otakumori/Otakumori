/**
 * Enterprise Feature Flag System - Main Export
 *
 * This is the main entry point for the enterprise feature flag system.
 * It provides a clean, type-safe API for both server-side and client-side usage.
 */

// Core types
export type {
  FeatureFlagKey,
  FeatureFlagValue,
  FeatureFlag,
  FeatureFlagConfig,
  FeatureFlagContext,
  FeatureFlagEvaluationContext,
  ABTest,
  ABTestVariant,
  FeatureFlagProvider as FeatureFlagProviderType,
  FeatureFlagProviderConfig,
  GameCubeBootFrequency,
  PerformanceMonitoringLevel,
  MiniGameDifficulty,
  ProductRecommendationAlgorithm,
  GameCubeConfig,
  PerformanceConfig,
  CommerceConfig,
} from './types';

// Type guards
export {
  isGameCubeBootFrequency,
  isPerformanceMonitoringLevel,
  isMiniGameDifficulty,
  isProductRecommendationAlgorithm,
} from './types';

// Configuration
export { FEATURE_FLAG_CONFIG, getEnvironmentOverrides, AB_TESTS } from './config';

// Server-side provider and evaluation
export {
  getFeatureFlagProvider,
  evaluateFeatureFlag,
  isFeatureEnabled,
  getFeatureFlagValue,
} from './provider';

// React hooks and components
export {
  FeatureFlagProvider,
  useFeatureFlags,
  useFeatureFlag,
  useFeatureFlagValue,
  FeatureFlag as FeatureFlagComponent,
  withFeatureFlag,
  useABTest,
  FeatureFlagDebugger,
  useSSRSafeFeatureFlag,
} from './react';

// Utility classes and functions
export {
  PerformanceMonitor,
  GameCubeFeatures,
  MiniGameFeatures,
  CommerceFeatures,
  AnalyticsFeatures,
  SecurityFeatures,
  DevelopmentFeatures,
  FeatureFlagDebugger as FeatureFlagDebugUtil,
  TypeSafeFlags,
  initializeFeatureFlags,
  warmFeatureFlagCache,
} from './utils';

/**
 * Quick access functions for common use cases
 */

import { isFeatureEnabled, getFeatureFlagValue } from './provider';
import { GameCubeFeatures, MiniGameFeatures, CommerceFeatures } from './utils';

/**
 * Check if GameCube boot animation should be shown
 * Combines multiple flags and localStorage logic
 */
export const shouldShowGameCubeBootAnimation = GameCubeFeatures.shouldShowBootAnimation;

/**
 * Check if mini-games are enabled
 */
export const areMiniGamesEnabled = MiniGameFeatures.isEnabled;

/**
 * Get the product recommendation algorithm to use
 */
export const getProductRecommendationAlgorithm = CommerceFeatures.getRecommendationAlgorithm;

/**
 * Common flag checks for quick access
 */
export const QuickFlags = {
  // Performance
  isPerformanceMonitoringEnabled: () => isFeatureEnabled('PERFORMANCE_MONITORING_LEVEL'),
  isCoreWebVitalsTrackingEnabled: () => isFeatureEnabled('CORE_WEB_VITALS_TRACKING'),

  // UI/UX
  isDarkGlassThemeV2Enabled: () => isFeatureEnabled('DARK_GLASS_THEME_V2'),
  isPetalEffectsEnhanced: () => isFeatureEnabled('PETAL_EFFECTS_ENHANCED'),
  isAccessibilityEnhancedMode: () => isFeatureEnabled('ACCESSIBILITY_ENHANCED_MODE'),

  // Commerce
  isPrintifyV2Enabled: () => isFeatureEnabled('PRINTIFY_INTEGRATION_V2'),
  isRealTimeInventoryEnabled: () => isFeatureEnabled('REAL_TIME_INVENTORY'),
  isStripeV2Enabled: () => isFeatureEnabled('STRIPE_CHECKOUT_V2'),

  // Analytics
  isGA4EnhancedTrackingEnabled: () => isFeatureEnabled('GA4_ENHANCED_TRACKING'),
  isSentryPerformanceEnabled: () => isFeatureEnabled('SENTRY_PERFORMANCE_MONITORING'),
  isABTestingEnabled: () => isFeatureEnabled('A_B_TESTING_FRAMEWORK'),

  // Security
  isEnhancedCSRFEnabled: () => isFeatureEnabled('CSRF_PROTECTION_ENHANCED'),
  isRedisRateLimitingEnabled: () => isFeatureEnabled('RATE_LIMITING_REDIS'),
  isGDPRComplianceEnabled: () => isFeatureEnabled('GDPR_COMPLIANCE_MODE'),

  // Development
  isDebuggingToolsEnabled: () => isFeatureEnabled('DEBUGGING_TOOLS'),
  isEnhancedErrorBoundaryEnabled: () => isFeatureEnabled('ERROR_BOUNDARY_ENHANCED'),
} as const;

/**
 * Feature flag constants for common values
 */
export const FeatureFlagConstants = {
  GAMECUBE_BOOT_FREQUENCIES: ['once_per_day', 'always', 'never', 'first_visit_only'] as const,
  PERFORMANCE_MONITORING_LEVELS: ['off', 'basic', 'advanced', 'debug'] as const,
  MINI_GAME_DIFFICULTIES: ['easy', 'medium', 'hard', 'adaptive'] as const,
  PRODUCT_RECOMMENDATION_ALGORITHMS: [
    'collaborative',
    'content_based',
    'hybrid',
    'ai_enhanced',
  ] as const,
} as const;

/**
 * Default export with most commonly used functions
 */
const FeatureFlags = {
  // Evaluation functions
  isEnabled: isFeatureEnabled,
  getValue: getFeatureFlagValue,

  // Quick checks
  ...QuickFlags,

  // Feature-specific utilities
  GameCube: GameCubeFeatures,
  MiniGames: MiniGameFeatures,
  Commerce: CommerceFeatures,

  // Constants
  Constants: FeatureFlagConstants,
};

export default FeatureFlags;
