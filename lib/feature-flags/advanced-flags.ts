/**
 * Advanced Enterprise Feature Flag System
 *
 * Comprehensive feature flag management with:
 * - A/B testing capabilities
 * - Gradual rollouts
 * - User targeting & segmentation
 * - Real-time configuration
 * - Analytics integration
 * - Rollback mechanisms
 */

import { metricsCollector } from '@/lib/monitoring/advanced-metrics';

export interface User {
  id: string;
  email?: string;
  role?: string;
  country?: string;
  registrationDate?: Date;
  isPremium?: boolean;
  metadata?: Record<string, any>;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'json';
  defaultValue: any;
  enabled: boolean;

  // Targeting rules
  rules: TargetingRule[];

  // Rollout configuration
  rollout: RolloutConfig;

  // A/B testing
  experiments?: ExperimentConfig[];

  // Metadata
  tags: string[];
  owner: string;
  createdAt: Date;
  updatedAt: Date;

  // Analytics
  trackingEvents?: string[];
}

export interface TargetingRule {
  id: string;
  name: string;
  condition: ConditionSet;
  value: any;
  priority: number;
  enabled: boolean;
}

export interface ConditionSet {
  operator: 'AND' | 'OR';
  conditions: Condition[];
}

export interface Condition {
  property: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in' | 'contains' | 'regex';
  value: any;
}

export interface RolloutConfig {
  type: 'percentage' | 'whitelist' | 'gradual';
  percentage?: number;
  whitelist?: string[];
  gradual?: {
    startPercentage: number;
    endPercentage: number;
    stepSize: number;
    stepDuration: number; // hours
    startTime: Date;
  };
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  variants: ExperimentVariant[];
  allocation: Record<string, number>; // variant -> percentage
  metrics: string[];
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'running' | 'completed' | 'stopped';
}

export interface ExperimentVariant {
  id: string;
  name: string;
  value: any;
  description?: string;
}

export interface FlagEvaluation {
  flagKey: string;
  value: any;
  variant?: string;
  reason: string;
  ruleId?: string;
  timestamp: Date;
}

export class AdvancedFeatureFlagService {
  private static instance: AdvancedFeatureFlagService;
  private flags: Map<string, FeatureFlag> = new Map();
  private evaluationCache: Map<string, { value: any; expiry: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeDefaultFlags();
  }

  static getInstance(): AdvancedFeatureFlagService {
    if (!AdvancedFeatureFlagService.instance) {
      AdvancedFeatureFlagService.instance = new AdvancedFeatureFlagService();
    }
    return AdvancedFeatureFlagService.instance;
  }

  /**
   * Evaluate a feature flag for a specific user
   */
  async evaluate(flagKey: string, user: User, defaultValue?: any): Promise<FlagEvaluation> {
    const cacheKey = `${flagKey}:${user.id}`;
    const cached = this.evaluationCache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return {
        flagKey,
        value: cached.value,
        reason: 'cached',
        timestamp: new Date(),
      };
    }

    const flag = this.flags.get(flagKey);
    if (!flag) {
      const value = defaultValue ?? null;
      this.recordEvaluation(flagKey, user, value, 'flag_not_found');
      return {
        flagKey,
        value,
        reason: 'flag_not_found',
        timestamp: new Date(),
      };
    }

    if (!flag.enabled) {
      const value = defaultValue ?? flag.defaultValue;
      this.recordEvaluation(flagKey, user, value, 'flag_disabled');
      return {
        flagKey,
        value,
        reason: 'flag_disabled',
        timestamp: new Date(),
      };
    }

    // Check experiments first
    if (flag.experiments) {
      for (const experiment of flag.experiments) {
        if (experiment.status === 'running') {
          const experimentResult = this.evaluateExperiment(experiment, user);
          if (experimentResult) {
            this.cacheEvaluation(cacheKey, experimentResult.value);
            this.recordEvaluation(
              flagKey,
              user,
              experimentResult.value,
              'experiment',
              experiment.id,
            );
            return {
              flagKey,
              value: experimentResult.value,
              variant: experimentResult.variant,
              reason: 'experiment',
              timestamp: new Date(),
            };
          }
        }
      }
    }

    // Check targeting rules
    const ruleResult = this.evaluateRules(flag.rules, user);
    if (ruleResult) {
      this.cacheEvaluation(cacheKey, ruleResult.value);
      this.recordEvaluation(flagKey, user, ruleResult.value, 'rule', ruleResult.ruleId);
      return {
        flagKey,
        value: ruleResult.value,
        reason: 'rule',
        ruleId: ruleResult.ruleId,
        timestamp: new Date(),
      };
    }

    // Check rollout configuration
    const rolloutResult = this.evaluateRollout(flag.rollout, user);
    if (rolloutResult.included) {
      this.cacheEvaluation(cacheKey, flag.defaultValue);
      this.recordEvaluation(flagKey, user, flag.defaultValue, 'rollout');
      return {
        flagKey,
        value: flag.defaultValue,
        reason: 'rollout',
        timestamp: new Date(),
      };
    }

    // Default value
    const value = defaultValue ?? flag.defaultValue;
    this.cacheEvaluation(cacheKey, value);
    this.recordEvaluation(flagKey, user, value, 'default');
    return {
      flagKey,
      value,
      reason: 'default',
      timestamp: new Date(),
    };
  }

  /**
   * Evaluate experiment variant for user
   */
  private evaluateExperiment(
    experiment: ExperimentConfig,
    user: User,
  ): { value: any; variant: string } | null {
    const hash = this.hashUserForExperiment(user.id, experiment.id);
    const bucket = hash % 100;

    let cumulative = 0;
    for (const [variantId, percentage] of Object.entries(experiment.allocation)) {
      cumulative += percentage;
      if (bucket < cumulative) {
        const variant = experiment.variants.find((v) => v.id === variantId);
        if (variant) {
          return { value: variant.value, variant: variant.id };
        }
      }
    }

    return null;
  }

  /**
   * Evaluate targeting rules
   */
  private evaluateRules(rules: TargetingRule[], user: User): { value: any; ruleId: string } | null {
    const sortedRules = rules
      .filter((rule) => rule.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (this.evaluateConditionSet(rule.condition, user)) {
        return { value: rule.value, ruleId: rule.id };
      }
    }

    return null;
  }

  /**
   * Evaluate condition set
   */
  private evaluateConditionSet(conditionSet: ConditionSet, user: User): boolean {
    const results = conditionSet.conditions.map((condition) =>
      this.evaluateCondition(condition, user),
    );

    return conditionSet.operator === 'AND' ? results.every((r) => r) : results.some((r) => r);
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(condition: Condition, user: User): boolean {
    const userValue = this.getUserProperty(user, condition.property);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'eq':
        return userValue === conditionValue;
      case 'ne':
        return userValue !== conditionValue;
      case 'gt':
        return userValue > conditionValue;
      case 'lt':
        return userValue < conditionValue;
      case 'gte':
        return userValue >= conditionValue;
      case 'lte':
        return userValue <= conditionValue;
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(userValue);
      case 'not_in':
        return Array.isArray(conditionValue) && !conditionValue.includes(userValue);
      case 'contains':
        return typeof userValue === 'string' && userValue.includes(conditionValue);
      case 'regex':
        return typeof userValue === 'string' && new RegExp(conditionValue).test(userValue);
      default:
        return false;
    }
  }

  /**
   * Evaluate rollout configuration
   */
  private evaluateRollout(rollout: RolloutConfig, user: User): { included: boolean } {
    switch (rollout.type) {
      case 'percentage':
        const hash = this.hashUser(user.id);
        return { included: hash % 100 < (rollout.percentage ?? 0) };

      case 'whitelist':
        return { included: rollout.whitelist?.includes(user.id) ?? false };

      case 'gradual':
        if (!rollout.gradual) return { included: false };

        const now = new Date();
        const elapsed = now.getTime() - rollout.gradual.startTime.getTime();
        const elapsedHours = elapsed / (1000 * 60 * 60);
        const steps = Math.floor(elapsedHours / rollout.gradual.stepDuration);

        const currentPercentage = Math.min(
          rollout.gradual.endPercentage,
          rollout.gradual.startPercentage + steps * rollout.gradual.stepSize,
        );

        const userHash = this.hashUser(user.id);
        return { included: userHash % 100 < currentPercentage };

      default:
        return { included: false };
    }
  }

  /**
   * Get user property value with support for nested properties
   */
  private getUserProperty(user: User, property: string): any {
    const parts = property.split('.');
    let value: any = user;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Hash user ID for consistent bucketing
   */
  private hashUser(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Hash user for specific experiment
   */
  private hashUserForExperiment(userId: string, experimentId: string): number {
    return this.hashUser(`${userId}:${experimentId}`);
  }

  /**
   * Cache evaluation result
   */
  private cacheEvaluation(cacheKey: string, value: any): void {
    this.evaluationCache.set(cacheKey, {
      value,
      expiry: Date.now() + this.cacheTimeout,
    });
  }

  /**
   * Record evaluation for analytics
   */
  private recordEvaluation(
    flagKey: string,
    user: User,
    value: any,
    reason: string,
    ruleId?: string,
  ): void {
    metricsCollector.recordMetric('feature_flag_evaluation', 1, {
      flag: flagKey,
      reason,
      value: String(value),
      userId: user.id,
      userRole: user.role || 'unknown',
    });

    // Track flag usage for analytics
    if (reason === 'experiment' && ruleId) {
      metricsCollector.recordMetric('experiment_exposure', 1, {
        flag: flagKey,
        experiment: ruleId,
        userId: user.id,
      });
    }
  }

  /**
   * Create or update a feature flag
   */
  createFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): void {
    const now = new Date();
    const fullFlag: FeatureFlag = {
      ...flag,
      createdAt: now,
      updatedAt: now,
    };

    this.flags.set(flag.key, fullFlag);
    this.invalidateCache(flag.key);
  }

  /**
   * Update feature flag
   */
  updateFlag(key: string, updates: Partial<FeatureFlag>): boolean {
    const flag = this.flags.get(key);
    if (!flag) return false;

    const updatedFlag = {
      ...flag,
      ...updates,
      updatedAt: new Date(),
    };

    this.flags.set(key, updatedFlag);
    this.invalidateCache(key);
    return true;
  }

  /**
   * Delete feature flag
   */
  deleteFlag(key: string): boolean {
    const deleted = this.flags.delete(key);
    if (deleted) {
      this.invalidateCache(key);
    }
    return deleted;
  }

  /**
   * Get all flags
   */
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Get flag by key
   */
  getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  /**
   * Invalidate cache for specific flag
   */
  private invalidateCache(flagKey: string): void {
    const keysToDelete = Array.from(this.evaluationCache.keys()).filter((key) =>
      key.startsWith(`${flagKey}:`),
    );

    for (const key of keysToDelete) {
      this.evaluationCache.delete(key);
    }
  }

  /**
   * Initialize default feature flags
   */
  private initializeDefaultFlags(): void {
    // GameCube boot animation
    this.createFlag({
      key: 'gamecube_boot_animation',
      name: 'GameCube Boot Animation',
      description: 'Enable/disable the GameCube boot sequence',
      type: 'boolean',
      defaultValue: true,
      enabled: true,
      rules: [
        {
          id: 'mobile_users',
          name: 'Disable for mobile users',
          condition: {
            operator: 'AND',
            conditions: [{ property: 'metadata.isMobile', operator: 'eq', value: true }],
          },
          value: false,
          priority: 1,
          enabled: true,
        },
      ],
      rollout: {
        type: 'percentage',
        percentage: 100,
      },
      tags: ['ui', 'animation'],
      owner: 'frontend-team',
      trackingEvents: [
        'boot_animation_started',
        'boot_animation_completed',
        'boot_animation_skipped',
      ],
    });

    // Petal click interactions
    this.createFlag({
      key: 'petal_click_interactions',
      name: 'Petal Click Interactions',
      description: 'Enable clickable petals on homepage',
      type: 'boolean',
      defaultValue: true,
      enabled: true,
      rules: [],
      rollout: {
        type: 'gradual',
        gradual: {
          startPercentage: 10,
          endPercentage: 100,
          stepSize: 10,
          stepDuration: 24,
          startTime: new Date(),
        },
      },
      tags: ['interaction', 'homepage'],
      owner: 'product-team',
      trackingEvents: ['petal_clicked', 'petal_collected'],
    });

    // Advanced search
    this.createFlag({
      key: 'advanced_search_v2',
      name: 'Advanced Search V2',
      description: 'New search experience with AI-powered suggestions',
      type: 'boolean',
      defaultValue: false,
      enabled: true,
      rules: [
        {
          id: 'premium_users',
          name: 'Enable for premium users',
          condition: {
            operator: 'AND',
            conditions: [{ property: 'isPremium', operator: 'eq', value: true }],
          },
          value: true,
          priority: 1,
          enabled: true,
        },
      ],
      rollout: {
        type: 'percentage',
        percentage: 25,
      },
      experiments: [
        {
          id: 'search_v2_experiment',
          name: 'Search V2 A/B Test',
          description: 'Test new search interface vs current',
          hypothesis: 'New search will improve conversion by 15%',
          variants: [
            { id: 'control', name: 'Current Search', value: false },
            { id: 'treatment', name: 'New Search V2', value: true },
          ],
          allocation: { control: 50, treatment: 50 },
          metrics: ['search_clicks', 'purchase_conversion', 'search_abandonment'],
          startDate: new Date(),
          status: 'running',
        },
      ],
      tags: ['search', 'ai', 'experiment'],
      owner: 'search-team',
      trackingEvents: ['search_performed', 'search_result_clicked', 'search_converted'],
    });

    // Performance monitoring level
    this.createFlag({
      key: 'performance_monitoring_level',
      name: 'Performance Monitoring Level',
      description: 'Control level of performance monitoring',
      type: 'string',
      defaultValue: 'basic',
      enabled: true,
      rules: [
        {
          id: 'admin_users',
          name: 'Full monitoring for admins',
          condition: {
            operator: 'AND',
            conditions: [{ property: 'role', operator: 'eq', value: 'admin' }],
          },
          value: 'detailed',
          priority: 1,
          enabled: true,
        },
      ],
      rollout: {
        type: 'percentage',
        percentage: 100,
      },
      tags: ['monitoring', 'performance'],
      owner: 'platform-team',
    });
  }

  /**
   * Get experiment results
   */
  getExperimentResults(experimentId: string): any {
    // This would integrate with analytics system
    // to provide experiment conversion rates, statistical significance, etc.
    return {
      experimentId,
      status: 'collecting_data',
      variants: [
        { id: 'control', conversions: 120, exposures: 1000, rate: 0.12 },
        { id: 'treatment', conversions: 145, exposures: 980, rate: 0.148 },
      ],
      statisticalSignificance: 0.85,
      confidence: 95,
    };
  }
}

// Convenience functions for common flag evaluations
export async function isFeatureEnabled(flagKey: string, user: User): Promise<boolean> {
  const service = AdvancedFeatureFlagService.getInstance();
  const result = await service.evaluate(flagKey, user, false);
  return Boolean(result.value);
}

export async function getFeatureValue<T>(flagKey: string, user: User, defaultValue: T): Promise<T> {
  const service = AdvancedFeatureFlagService.getInstance();
  const result = await service.evaluate(flagKey, user, defaultValue);
  return result.value as T;
}

// Export singleton instance
export const featureFlagService = AdvancedFeatureFlagService.getInstance();
