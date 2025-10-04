/**
 * Enhanced Monitoring Utilities
 *
 * Provides centralized monitoring, error tracking, and performance metrics
 * with PII scrubbing and custom event tracking.
 *
 * @fileoverview Comprehensive monitoring and observability utilities
 * @author Otaku-mori Team
 * @since 1.0.0
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Custom event categories for tracking
 */
export const EVENT_CATEGORIES = {
  AUTH: 'auth',
  PAYMENT: 'payment',
  GAME: 'game',
  USER: 'user',
  PERFORMANCE: 'performance',
  ERROR: 'error',
} as const;

/**
 * Custom event actions
 */
export const EVENT_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PURCHASE: 'purchase',
  GAME_START: 'game_start',
  GAME_COMPLETE: 'game_complete',
  AVATAR_SAVE: 'avatar_save',
  ERROR_OCCURRED: 'error_occurred',
} as const;

/**
 * Enhanced error tracking with context
 *
 * @param error - The error object
 * @param context - Additional context for the error
 * @param tags - Custom tags for categorization
 */
export function trackError(
  error: Error | string,
  context?: Record<string, any>,
  tags?: Record<string, string>,
) {
  Sentry.withScope((scope) => {
    // Add custom tags
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    // Add context
    if (context) {
      scope.setContext('error_context', context);
    }

    // Capture the error
    if (typeof error === 'string') {
      Sentry.captureMessage(error, 'error');
    } else {
      Sentry.captureException(error);
    }
  });
}

/**
 * Track custom events with structured data
 *
 * @param event - Event name
 * @param category - Event category
 * @param data - Event data
 * @param tags - Custom tags
 */
export function trackEvent(
  event: string,
  category: string,
  data?: Record<string, any>,
  tags?: Record<string, string>,
) {
  Sentry.addBreadcrumb({
    message: event,
    category,
    data: data || {},
    level: 'info',
  });

  // Also track as custom event
  Sentry.withScope((scope) => {
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    scope.setContext('event_data', data || {});
    Sentry.captureMessage(`Event: ${event}`, 'info');
  });
}

/**
 * Track user actions with enhanced context
 *
 * @param action - User action
 * @param category - Action category
 * @param metadata - Additional metadata
 */
export function trackUserAction(action: string, category: string, metadata?: Record<string, any>) {
  trackEvent(
    action,
    category,
    {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...metadata,
    },
    {
      action_type: 'user_action',
      category,
    },
  );
}

/**
 * Track performance metrics
 *
 * @param metric - Performance metric name
 * @param value - Metric value
 * @param unit - Metric unit (ms, bytes, etc.)
 * @param context - Additional context
 */
export function trackPerformance(
  metric: string,
  value: number,
  unit: string = 'ms',
  context?: Record<string, any>,
) {
  Sentry.addBreadcrumb({
    message: `Performance: ${metric}`,
    category: 'performance',
    data: {
      value,
      unit,
      ...context,
    },
    level: 'info',
  });

  // Track as custom metric
  trackEvent(`perf_${metric}`, EVENT_CATEGORIES.PERFORMANCE, {
    value,
    unit,
    timestamp: Date.now(),
    ...context,
  });
}

/**
 * Track payment events with enhanced security
 *
 * @param action - Payment action
 * @param amount - Payment amount (in cents)
 * @param currency - Currency code
 * @param metadata - Additional metadata (scrubbed)
 */
export function trackPayment(
  action: string,
  amount?: number,
  currency: string = 'USD',
  metadata?: Record<string, any>,
) {
  const scrubbedMetadata = {
    ...metadata,
    // Ensure sensitive data is not tracked
    cardNumber: undefined,
    cvv: undefined,
    expiryDate: undefined,
  };

  trackEvent(
    action,
    EVENT_CATEGORIES.PAYMENT,
    {
      amount,
      currency,
      timestamp: new Date().toISOString(),
      ...scrubbedMetadata,
    },
    {
      payment_action: action,
      currency,
    },
  );
}

/**
 * Track game events
 *
 * @param action - Game action
 * @param gameId - Game identifier
 * @param score - Game score (if applicable)
 * @param metadata - Additional game metadata
 */
export function trackGameEvent(
  action: string,
  gameId: string,
  score?: number,
  metadata?: Record<string, any>,
) {
  trackEvent(
    action,
    EVENT_CATEGORIES.GAME,
    {
      gameId,
      score,
      timestamp: new Date().toISOString(),
      ...metadata,
    },
    {
      game_action: action,
      game_id: gameId,
    },
  );
}

/**
 * Set user context for enhanced tracking
 *
 * @param userId - User ID
 * @param userData - User data (scrubbed)
 */
export function setUserContext(userId: string, userData?: Record<string, any>) {
  const scrubbedUserData = {
    ...userData,
    // Scrub sensitive user data
    email: userData?.email ? '[REDACTED]' : undefined,
    phone: userData?.phone ? '[REDACTED]' : undefined,
  };

  Sentry.setUser({
    id: userId,
    ...scrubbedUserData,
  });
}

/**
 * Track API request performance
 *
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param statusCode - Response status code
 * @param duration - Request duration in ms
 * @param metadata - Additional metadata
 */
export function trackApiRequest(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  metadata?: Record<string, any>,
) {
  trackPerformance('api_request', duration, 'ms', {
    endpoint,
    method,
    statusCode,
    ...metadata,
  });

  // Track as custom event for API monitoring
  trackEvent(
    'api_request',
    'api',
    {
      endpoint,
      method,
      statusCode,
      duration,
      timestamp: new Date().toISOString(),
      ...metadata,
    },
    {
      api_endpoint: endpoint,
      http_method: method,
      status_code: statusCode.toString(),
    },
  );
}

/**
 * Track authentication events
 *
 * @param action - Auth action
 * @param provider - Auth provider
 * @param success - Whether action was successful
 * @param metadata - Additional metadata
 */
export function trackAuth(
  action: string,
  provider?: string,
  success: boolean = true,
  metadata?: Record<string, any>,
) {
  trackEvent(
    action,
    EVENT_CATEGORIES.AUTH,
    {
      provider,
      success,
      timestamp: new Date().toISOString(),
      ...metadata,
    },
    {
      auth_action: action,
      auth_provider: provider || 'unknown',
      auth_success: success.toString(),
    },
  );
}

/**
 * Create a performance transaction
 *
 * @param name - Transaction name
 * @param op - Operation type
 * @returns Transaction object
 */
export function startTransaction(name: string, op: string = 'custom') {
  // Note: startTransaction is deprecated in newer Sentry versions
  // Use startSpan or startInactiveSpan instead
  return Sentry.startInactiveSpan({
    name,
    op,
  });
}

/**
 * Utility to wrap async functions with error tracking
 *
 * @param fn - Async function to wrap
 * @param context - Error context
 * @returns Wrapped function
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string,
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      trackError(error as Error, { context, args: args.length });
      throw error;
    }
  }) as T;
}
