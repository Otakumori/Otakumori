/**
 * Enterprise Feature Flag Provider
 *
 * This module implements the core feature flag evaluation logic with support for:
 * - Server-side evaluation for security
 * - Client-side hydration for performance
 * - A/B testing capabilities
 * - Caching and performance optimization
 * - Multiple provider backends (local, ConfigCat, Flagsmith)
 */

import {
  type FeatureFlagKey,
  type FeatureFlagValue,
  type FeatureFlagEvaluationContext,
  type FeatureFlagProviderConfig,
  type ABTestVariant,
} from './types';
import { FEATURE_FLAG_CONFIG, getEnvironmentOverrides, AB_TESTS } from './config';
import { clientEnv } from '@/env/client';
export class FeatureFlagProvider {
  private cache = new Map<string, { value: FeatureFlagValue; timestamp: number }>();
  private config: FeatureFlagProviderConfig;
  private cacheTTL = 5 * 60 * 1000; // 5 minutes default

  constructor() {
    // Simplified config to match FeatureFlagProviderConfig interface
    this.config = {
      provider: 'local', // Use local provider since external API keys not available
      cacheTTL: 300000, // 5 minutes
    };
    this.cacheTTL = this.config.cacheTTL || this.cacheTTL;
  }

  /**
   * Evaluate a feature flag with proper context
   */
  async evaluateFlag(
    key: FeatureFlagKey,
    context: FeatureFlagEvaluationContext,
  ): Promise<FeatureFlagValue> {
    // Check cache first
    const cacheKey = this.generateCacheKey(key, context);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.value;
    }

    // Get base configuration
    const flagConfig = FEATURE_FLAG_CONFIG[key];
    if (!flagConfig) {
      console.warn(`Feature flag ${key} not found in configuration`);
      return false;
    }

    // Apply environment overrides
    const envOverrides = getEnvironmentOverrides(context.environment);
    const effectiveConfig = { ...flagConfig, ...envOverrides[key] };

    // Check if flag is enabled for this environment
    if (!effectiveConfig.enabled) {
      return effectiveConfig.defaultValue;
    }

    if (
      effectiveConfig.environment !== 'all' &&
      effectiveConfig.environment !== context.environment
    ) {
      return effectiveConfig.defaultValue;
    }

    // Check dependencies
    if (effectiveConfig.dependencies) {
      for (const dependency of effectiveConfig.dependencies) {
        const dependencyValue = await this.evaluateFlag(dependency, context);
        if (!dependencyValue) {
          return effectiveConfig.defaultValue;
        }
      }
    }

    // Evaluate rollout percentage
    if (effectiveConfig.rolloutPercentage < 100) {
      const userHash = this.hashUser(context.userId || 'anonymous', key);
      const userPercentile = userHash % 100;

      if (userPercentile >= effectiveConfig.rolloutPercentage) {
        return effectiveConfig.defaultValue;
      }
    }

    // Check for A/B tests
    const abTestResult = await this.evaluateABTest(key, context);
    if (abTestResult !== null) {
      const result = abTestResult;
      this.cache.set(cacheKey, { value: result, timestamp: Date.now() });
      return result;
    }

    // Use provider-specific evaluation if configured
    let result: FeatureFlagValue;
    try {
      result = await this.evaluateWithProvider(key, context);
    } catch (error) {
      console.error(`Error evaluating feature flag ${key}:`, error);
      result = effectiveConfig.defaultValue;
    }

    // Cache the result
    this.cache.set(cacheKey, { value: result, timestamp: Date.now() });
    return result;
  }

  /**
   * Check if a feature flag is enabled (boolean conversion)
   */
  async isEnabled(key: FeatureFlagKey, context: FeatureFlagEvaluationContext): Promise<boolean> {
    const value = await this.evaluateFlag(key, context);
    return Boolean(value);
  }

  /**
   * Get typed feature flag value
   */
  async getValue<T extends FeatureFlagValue>(
    key: FeatureFlagKey,
    context: FeatureFlagEvaluationContext,
    defaultValue?: T,
  ): Promise<T> {
    const value = await this.evaluateFlag(key, context);
    return (value as T) ?? (defaultValue as T);
  }

  /**
   * Evaluate A/B test for a specific flag
   */
  private async evaluateABTest(
    key: FeatureFlagKey,
    context: FeatureFlagEvaluationContext,
  ): Promise<FeatureFlagValue | null> {
    // Check if there's an active A/B test for this flag
    const relatedTest = Object.values(AB_TESTS).find(
      (test) => test.key.includes(key.toLowerCase()) && test.isActive,
    );

    if (!relatedTest) {
      return null;
    }

    // Check if test is within date range
    const now = new Date();
    if (now < relatedTest.startDate || (relatedTest.endDate && now > relatedTest.endDate)) {
      return null;
    }

    // Determine variant based on user hash
    const userHash = this.hashUser(context.userId || 'anonymous', relatedTest.key);
    const variant = this.selectVariant(relatedTest.variants, userHash);

    if (!variant) {
      return null;
    }

    // Return the variant name as the flag value
    return variant.name;
  }

  /**
   * Select A/B test variant based on user hash and weights
   */
  private selectVariant(variants: ABTestVariant[], userHash: number): ABTestVariant | null {
    const enabledVariants = variants.filter((v) => v.enabled);
    if (enabledVariants.length === 0) {
      return null;
    }

    const totalWeight = enabledVariants.reduce((sum, v) => sum + v.weight, 0);
    const normalizedHash = userHash % totalWeight;

    let currentWeight = 0;
    for (const variant of enabledVariants) {
      currentWeight += variant.weight;
      if (normalizedHash < currentWeight) {
        return variant;
      }
    }

    return enabledVariants[0];
  }

  /**
   * Provider-specific evaluation (ConfigCat, Flagsmith, etc.)
   */
  private async evaluateWithProvider(
    key: FeatureFlagKey,
    context: FeatureFlagEvaluationContext,
  ): Promise<FeatureFlagValue> {
    const flagConfig = FEATURE_FLAG_CONFIG[key];

    switch (this.config.provider) {
      case 'configcat':
        return await this.evaluateWithConfigCat(key, context);

      case 'flagsmith':
        return await this.evaluateWithFlagsmith(key, context);

      case 'local':
      default:
        return flagConfig.defaultValue;
    }
  }

  /**
   * ConfigCat integration
   */
  private async evaluateWithConfigCat(
    key: FeatureFlagKey,
    context: FeatureFlagEvaluationContext,
  ): Promise<FeatureFlagValue> {
    if (!this.config.apiKey) {
      throw new Error('ConfigCat API key not provided');
    }

    // In a real implementation, you would use the ConfigCat SDK here
    // Log context for debugging integration
    console.warn('ConfigCat evaluation', {
      key,
      userId: context.userId,
      environment: context.environment,
    });

    // For now, return the default value
    return FEATURE_FLAG_CONFIG[key].defaultValue;
  }

  /**
   * Flagsmith integration
   */
  private async evaluateWithFlagsmith(
    key: FeatureFlagKey,
    context: FeatureFlagEvaluationContext,
  ): Promise<FeatureFlagValue> {
    if (!this.config.apiKey) {
      throw new Error('Flagsmith API key not provided');
    }

    // In a real implementation, you would use the Flagsmith SDK here
    // Log context for debugging integration
    console.warn('Flagsmith evaluation', {
      key,
      userId: context.userId,
      environment: context.environment,
    });

    // For now, return the default value
    return FEATURE_FLAG_CONFIG[key].defaultValue;
  }

  /**
   * Generate cache key for flag evaluation
   */
  private generateCacheKey(key: FeatureFlagKey, context: FeatureFlagEvaluationContext): string {
    return `flag:${key}:${context.userId || 'anon'}:${context.environment}:${context.userRole || 'user'}`;
  }

  /**
   * Hash user ID for consistent rollout and A/B testing
   */
  private hashUser(userId: string, salt: string): number {
    let hash = 0;
    const input = `${userId}:${salt}`;

    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash);
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
let providerInstance: FeatureFlagProvider | null = null;

/**
 * Get the global feature flag provider instance
 */
export function getFeatureFlagProvider(): FeatureFlagProvider {
  if (!providerInstance) {
    // Use safe defaults for feature flags to avoid env validation errors
    const config: FeatureFlagProviderConfig = {
      provider: 'local', // Always use local provider for now
      apiKey: undefined,
      baseUrl: undefined,
      pollingInterval: 60000, // 1 minute
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    };

    // Log configuration for debugging
    console.warn('Initializing feature flag provider', {
      provider: config.provider,
      cacheTTL: config.cacheTTL,
    });

    providerInstance = new FeatureFlagProvider();
  }

  return providerInstance;
}

/**
 * Server-side feature flag evaluation
 */
export async function evaluateFeatureFlag(
  key: FeatureFlagKey,
  context: Partial<FeatureFlagEvaluationContext> = {},
): Promise<FeatureFlagValue> {
  const provider = getFeatureFlagProvider();

  const fullContext: FeatureFlagEvaluationContext = {
    environment: clientEnv.NODE_ENV || 'development',
    timestamp: Date.now(),
    ...context,
  };

  return provider.evaluateFlag(key, fullContext);
}

/**
 * Server-side boolean feature flag check
 */
export async function isFeatureEnabled(
  key: FeatureFlagKey,
  context: Partial<FeatureFlagEvaluationContext> = {},
): Promise<boolean> {
  const provider = getFeatureFlagProvider();

  const fullContext: FeatureFlagEvaluationContext = {
    environment: clientEnv.NODE_ENV || 'development',
    timestamp: Date.now(),
    ...context,
  };

  return provider.isEnabled(key, fullContext);
}

/**
 * Get feature flag value with type safety
 */
export async function getFeatureFlagValue<T extends FeatureFlagValue>(
  key: FeatureFlagKey,
  defaultValue?: T,
  context: Partial<FeatureFlagEvaluationContext> = {},
): Promise<T> {
  const provider = getFeatureFlagProvider();

  const fullContext: FeatureFlagEvaluationContext = {
    environment: clientEnv.NODE_ENV || 'development',
    timestamp: Date.now(),
    ...context,
  };

  return provider.getValue(key, fullContext, defaultValue);
}
