/**
 * Enterprise Feature Flag System Types
 *
 * This module defines the TypeScript types for the enterprise-grade feature flag system.
 * It provides type safety and IntelliSense support for all feature flags across the application.
 */

export type FeatureFlagKey =
  // GameCube & Animation Features
  | 'GAMECUBE_BOOT_ANIMATION'
  | 'GAMECUBE_BOOT_FREQUENCY'
  | 'GAMECUBE_AUDIO_ENABLED'
  | 'GAMECUBE_REDUCED_MOTION'

  // Performance & Monitoring
  | 'PERFORMANCE_MONITORING_LEVEL'
  | 'PERFORMANCE_BUDGETS_ENABLED'
  | 'BUNDLE_ANALYSIS_ENABLED'
  | 'CORE_WEB_VITALS_TRACKING'
  | 'REAL_USER_MONITORING'

  // Mini-Games & Entertainment
  | 'MINI_GAMES_ENABLED'
  | 'MINI_GAMES_DIFFICULTY_ADAPTIVE'
  | 'MINI_GAMES_LEADERBOARDS'
  | 'MINI_GAMES_ACHIEVEMENTS'
  | 'MINI_GAMES_SAVE_CLOUD'

  // Commerce & Printify
  | 'PRINTIFY_INTEGRATION_V2'
  | 'PRODUCT_RECOMMENDATIONS_AI'
  | 'PRODUCT_SEARCH_ENHANCED'
  | 'REAL_TIME_INVENTORY'
  | 'STRIPE_CHECKOUT_V2'
  | 'WISHLIST_TO_CART_OPTIMIZATION'

  // UI/UX Features
  | 'DARK_GLASS_THEME_V2'
  | 'PETAL_EFFECTS_ENHANCED'
  | 'ACCESSIBILITY_ENHANCED_MODE'
  | 'MOBILE_RESPONSIVE_V2'

  // Analytics & Tracking
  | 'GA4_ENHANCED_TRACKING'
  | 'SENTRY_PERFORMANCE_MONITORING'
  | 'USER_BEHAVIOR_ANALYTICS'
  | 'A_B_TESTING_FRAMEWORK'

  // Security & Compliance
  | 'CSRF_PROTECTION_ENHANCED'
  | 'RATE_LIMITING_REDIS'
  | 'GDPR_COMPLIANCE_MODE'
  | 'SECURITY_HEADERS_V2'

  // Developer Experience
  | 'DEV_MODE_ENHANCED'
  | 'DEBUGGING_TOOLS'
  | 'ERROR_BOUNDARY_ENHANCED';

export type FeatureFlagValue = boolean | string | number;

export interface FeatureFlag {
  key: FeatureFlagKey;
  value: FeatureFlagValue;
  enabled: boolean;
  environment: 'development' | 'staging' | 'production' | 'all';
  rolloutPercentage: number;
  dependencies?: FeatureFlagKey[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FeatureFlagConfig = {
  [K in FeatureFlagKey]: {
    defaultValue: FeatureFlagValue;
    enabled: boolean;
    environment: 'development' | 'staging' | 'production' | 'all';
    rolloutPercentage: number;
    dependencies?: FeatureFlagKey[];
    description: string;
  };
};

export interface FeatureFlagContext {
  flags: Map<FeatureFlagKey, FeatureFlagValue>;
  isEnabled: (key: FeatureFlagKey) => boolean;
  getValue: <T extends FeatureFlagValue>(key: FeatureFlagKey, defaultValue?: T) => T;
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface FeatureFlagEvaluationContext {
  userId?: string;
  userRole?: 'user' | 'moderator' | 'admin';
  environment: string;
  userAgent?: string;
  locale?: string;
  timestamp: number;
}

export interface ABTestVariant {
  name: string;
  weight: number;
  enabled: boolean;
}

export interface ABTest {
  key: string;
  variants: ABTestVariant[];
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
}

export type FeatureFlagProvider = 'local' | 'configcat' | 'flagsmith' | 'custom';

export interface FeatureFlagProviderConfig {
  provider: FeatureFlagProvider;
  apiKey?: string;
  baseUrl?: string;
  pollingInterval?: number;
  cacheKey?: string;
  cacheTTL?: number;
}

// Specific flag value types for better type safety
export type GameCubeBootFrequency = 'once_per_day' | 'always' | 'never' | 'first_visit_only';
export type PerformanceMonitoringLevel = 'off' | 'basic' | 'advanced' | 'debug';
export type MiniGameDifficulty = 'easy' | 'medium' | 'hard' | 'adaptive';
export type ProductRecommendationAlgorithm =
  | 'collaborative'
  | 'content_based'
  | 'hybrid'
  | 'ai_enhanced';

// Feature-specific configuration interfaces
export interface GameCubeConfig {
  bootAnimation: boolean;
  bootFrequency: GameCubeBootFrequency;
  audioEnabled: boolean;
  reducedMotion: boolean;
}

export interface PerformanceConfig {
  monitoringLevel: PerformanceMonitoringLevel;
  budgetsEnabled: boolean;
  coreWebVitalsTracking: boolean;
  realUserMonitoring: boolean;
}

export interface CommerceConfig {
  printifyV2: boolean;
  aiRecommendations: boolean;
  enhancedSearch: boolean;
  realTimeInventory: boolean;
  stripeV2: boolean;
}

// Type guard functions
export const isGameCubeBootFrequency = (value: any): value is GameCubeBootFrequency => {
  return ['once_per_day', 'always', 'never', 'first_visit_only'].includes(value);
};

export const isPerformanceMonitoringLevel = (value: any): value is PerformanceMonitoringLevel => {
  return ['off', 'basic', 'advanced', 'debug'].includes(value);
};

export const isMiniGameDifficulty = (value: any): value is MiniGameDifficulty => {
  return ['easy', 'medium', 'hard', 'adaptive'].includes(value);
};

export const isProductRecommendationAlgorithm = (
  value: any,
): value is ProductRecommendationAlgorithm => {
  return ['collaborative', 'content_based', 'hybrid', 'ai_enhanced'].includes(value);
};
