/**
 * Enterprise Feature Flag Configuration
 *
 * This module defines the default configuration for all feature flags in the application.
 * It serves as the single source of truth for feature flag definitions and their default values.
 */

import { type FeatureFlagConfig } from './types';

export const FEATURE_FLAG_CONFIG: FeatureFlagConfig = {
  // GameCube & Animation Features
  GAMECUBE_BOOT_ANIMATION: {
    defaultValue: true,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 100,
    description: 'Enable GameCube-style boot animation on mini-games page',
  },

  GAMECUBE_BOOT_FREQUENCY: {
    defaultValue: 'once_per_day',
    enabled: true,
    environment: 'all',
    rolloutPercentage: 100,
    dependencies: ['GAMECUBE_BOOT_ANIMATION'],
    description: 'Control how often the GameCube boot animation plays',
  },

  GAMECUBE_AUDIO_ENABLED: {
    defaultValue: true,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 80,
    dependencies: ['GAMECUBE_BOOT_ANIMATION'],
    description: 'Enable audio for GameCube boot sequence',
  },

  GAMECUBE_REDUCED_MOTION: {
    defaultValue: false,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 100,
    description: 'Respect prefers-reduced-motion for GameCube animations',
  },

  // Performance & Monitoring
  PERFORMANCE_MONITORING_LEVEL: {
    defaultValue: 'basic',
    enabled: true,
    environment: 'all',
    rolloutPercentage: 100,
    description: 'Set the level of performance monitoring',
  },

  PERFORMANCE_BUDGETS_ENABLED: {
    defaultValue: true,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 100,
    description: 'Enable performance budget enforcement',
  },

  BUNDLE_ANALYSIS_ENABLED: {
    defaultValue: false,
    enabled: true,
    environment: 'development',
    rolloutPercentage: 100,
    description: 'Enable automatic bundle analysis on builds',
  },

  CORE_WEB_VITALS_TRACKING: {
    defaultValue: true,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 100,
    description: 'Enable Core Web Vitals tracking with GA4',
  },

  REAL_USER_MONITORING: {
    defaultValue: true,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 50,
    dependencies: ['PERFORMANCE_MONITORING_LEVEL'],
    description: 'Enable real user monitoring with Sentry',
  },

  // Mini-Games & Entertainment
  MINI_GAMES_ENABLED: {
    defaultValue: true,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 100,
    description: 'Enable mini-games functionality',
  },

  MINI_GAMES_DIFFICULTY_ADAPTIVE: {
    defaultValue: false,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 25,
    dependencies: ['MINI_GAMES_ENABLED'],
    description: 'Enable adaptive difficulty system for mini-games',
  },

  MINI_GAMES_LEADERBOARDS: {
    defaultValue: true,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 100,
    dependencies: ['MINI_GAMES_ENABLED'],
    description: 'Enable leaderboards for mini-games',
  },

  MINI_GAMES_ACHIEVEMENTS: {
    defaultValue: true,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 80,
    dependencies: ['MINI_GAMES_ENABLED'],
    description: 'Enable achievement system for mini-games',
  },

  MINI_GAMES_SAVE_CLOUD: {
    defaultValue: false,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 10,
    dependencies: ['MINI_GAMES_ENABLED'],
    description: 'Enable cloud save functionality for game progress',
  },

  // Commerce & Printify
  PRINTIFY_INTEGRATION_V2: {
    defaultValue: false,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 25,
    description: 'Enable enhanced Printify integration with webhooks',
  },

  PRODUCT_RECOMMENDATIONS_AI: {
    defaultValue: false,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 15,
    description: 'Enable AI-powered product recommendations',
  },

  PRODUCT_SEARCH_ENHANCED: {
    defaultValue: true,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 100,
    description: 'Enable enhanced product search with filters',
  },

  REAL_TIME_INVENTORY: {
    defaultValue: false,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 30,
    dependencies: ['PRINTIFY_INTEGRATION_V2'],
    description: 'Enable real-time inventory synchronization',
  },

  STRIPE_CHECKOUT_V2: {
    defaultValue: false,
    enabled: true,
    environment: 'staging',
    rolloutPercentage: 50,
    description: 'Enable Stripe Checkout v2 integration',
  },

  WISHLIST_TO_CART_OPTIMIZATION: {
    defaultValue: true,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 100,
    description: 'Enable optimized wishlist to cart conversion flow',
  },

  // UI/UX Features
  DARK_GLASS_THEME_V2: {
    defaultValue: false,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 20,
    description: 'Enable enhanced dark glass theme with better contrast',
  },

  PETAL_EFFECTS_ENHANCED: {
    defaultValue: true,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 100,
    description: 'Enable enhanced petal animation effects',
  },

  ACCESSIBILITY_ENHANCED_MODE: {
    defaultValue: true,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 100,
    description: 'Enable enhanced accessibility features',
  },

  MOBILE_RESPONSIVE_V2: {
    defaultValue: false,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 40,
    description: 'Enable enhanced mobile responsive design',
  },

  // Analytics & Tracking
  GA4_ENHANCED_TRACKING: {
    defaultValue: true,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 100,
    description: 'Enable enhanced GA4 tracking with custom events',
  },

  SENTRY_PERFORMANCE_MONITORING: {
    defaultValue: true,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 100,
    description: 'Enable Sentry performance monitoring',
  },

  USER_BEHAVIOR_ANALYTICS: {
    defaultValue: true,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 80,
    dependencies: ['GA4_ENHANCED_TRACKING'],
    description: 'Enable detailed user behavior analytics',
  },

  A_B_TESTING_FRAMEWORK: {
    defaultValue: false,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 100,
    description: 'Enable A/B testing framework for experiments',
  },

  // Security & Compliance
  CSRF_PROTECTION_ENHANCED: {
    defaultValue: true,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 100,
    description: 'Enable enhanced CSRF protection mechanisms',
  },

  RATE_LIMITING_REDIS: {
    defaultValue: false,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 100,
    description: 'Enable Redis-backed rate limiting',
  },

  GDPR_COMPLIANCE_MODE: {
    defaultValue: true,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 100,
    description: 'Enable GDPR compliance features',
  },

  SECURITY_HEADERS_V2: {
    defaultValue: true,
    enabled: true,
    environment: 'production',
    rolloutPercentage: 100,
    description: 'Enable enhanced security headers',
  },

  // Developer Experience
  DEV_MODE_ENHANCED: {
    defaultValue: true,
    enabled: true,
    environment: 'development',
    rolloutPercentage: 100,
    description: 'Enable enhanced development mode features',
  },

  DEBUGGING_TOOLS: {
    defaultValue: true,
    enabled: true,
    environment: 'development',
    rolloutPercentage: 100,
    dependencies: ['DEV_MODE_ENHANCED'],
    description: 'Enable debugging tools and overlays',
  },

  ERROR_BOUNDARY_ENHANCED: {
    defaultValue: true,
    enabled: true,
    environment: 'all',
    rolloutPercentage: 100,
    description: 'Enable enhanced error boundaries with recovery',
  },
};

// Environment-specific overrides
export const getEnvironmentOverrides = (environment: string) => {
  const overrides: Partial<FeatureFlagConfig> = {};

  switch (environment) {
    case 'development':
      overrides.DEBUGGING_TOOLS = { ...FEATURE_FLAG_CONFIG.DEBUGGING_TOOLS, defaultValue: true };
      overrides.BUNDLE_ANALYSIS_ENABLED = {
        ...FEATURE_FLAG_CONFIG.BUNDLE_ANALYSIS_ENABLED,
        defaultValue: true,
      };
      break;

    case 'staging':
      overrides.STRIPE_CHECKOUT_V2 = {
        ...FEATURE_FLAG_CONFIG.STRIPE_CHECKOUT_V2,
        rolloutPercentage: 100,
      };
      overrides.PRINTIFY_INTEGRATION_V2 = {
        ...FEATURE_FLAG_CONFIG.PRINTIFY_INTEGRATION_V2,
        rolloutPercentage: 100,
      };
      break;

    case 'production':
      overrides.DEBUGGING_TOOLS = { ...FEATURE_FLAG_CONFIG.DEBUGGING_TOOLS, enabled: false };
      overrides.BUNDLE_ANALYSIS_ENABLED = {
        ...FEATURE_FLAG_CONFIG.BUNDLE_ANALYSIS_ENABLED,
        enabled: false,
      };
      break;
  }

  return overrides;
};

// A/B Test Configurations
export const AB_TESTS = {
  gamecube_boot_frequency: {
    key: 'gamecube_boot_frequency_test',
    variants: [
      { name: 'once_per_day', weight: 50, enabled: true },
      { name: 'always', weight: 25, enabled: true },
      { name: 'first_visit_only', weight: 25, enabled: true },
    ],
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-02-01'),
  },

  product_recommendations: {
    key: 'product_recommendations_algorithm',
    variants: [
      { name: 'collaborative', weight: 40, enabled: true },
      { name: 'content_based', weight: 30, enabled: true },
      { name: 'hybrid', weight: 20, enabled: true },
      { name: 'ai_enhanced', weight: 10, enabled: true },
    ],
    isActive: true,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-03-15'),
  },
};
