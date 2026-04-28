/**
 * Lightweight Monitoring Utilities
 *
 * Keeps monitoring calls dependency-light during normal builds. This avoids
 * pulling Sentry server instrumentation into routes that only need structured
 * logging or breadcrumbs.
 */

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

type MonitorPayload = Record<string, unknown> | undefined;

function emitMonitoringLog(kind: string, payload: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[monitoring:${kind}]`, payload);
  }
}

export function trackError(
  error: Error | string,
  context?: MonitorPayload,
  tags?: Record<string, string>,
) {
  emitMonitoringLog('error', {
    error: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack,
    context,
    tags,
  });
}

export function trackEvent(
  event: string,
  category: string,
  data?: MonitorPayload,
  tags?: Record<string, string>,
) {
  emitMonitoringLog('event', { event, category, data, tags });
}

export function trackUserAction(action: string, category: string, metadata?: MonitorPayload) {
  trackEvent(action, category, {
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    ...metadata,
  }, {
    action_type: 'user_action',
    category,
  });
}

export function trackPerformance(
  metric: string,
  value: number,
  unit: string = 'ms',
  context?: MonitorPayload,
) {
  trackEvent(`perf_${metric}`, EVENT_CATEGORIES.PERFORMANCE, {
    value,
    unit,
    timestamp: Date.now(),
    ...context,
  });
}

export function trackPayment(
  action: string,
  amount?: number,
  currency: string = 'USD',
  metadata?: MonitorPayload,
) {
  const scrubbedMetadata = {
    ...metadata,
    cardNumber: undefined,
    cvv: undefined,
    expiryDate: undefined,
  };

  trackEvent(action, EVENT_CATEGORIES.PAYMENT, {
    amount,
    currency,
    timestamp: new Date().toISOString(),
    ...scrubbedMetadata,
  }, {
    payment_action: action,
    currency,
  });
}

export function trackGameEvent(
  action: string,
  gameId: string,
  score?: number,
  metadata?: MonitorPayload,
) {
  trackEvent(action, EVENT_CATEGORIES.GAME, {
    gameId,
    score,
    timestamp: new Date().toISOString(),
    ...metadata,
  }, {
    game_action: action,
    game_id: gameId,
  });
}

export function setUserContext(userId: string, userData?: MonitorPayload) {
  emitMonitoringLog('user', {
    userId,
    userData: userData
      ? {
          ...userData,
          email: (userData as Record<string, unknown>).email ? '[REDACTED]' : undefined,
          phone: (userData as Record<string, unknown>).phone ? '[REDACTED]' : undefined,
        }
      : undefined,
  });
}

export function trackApiRequest(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  metadata?: MonitorPayload,
) {
  trackPerformance('api_request', duration, 'ms', {
    endpoint,
    method,
    statusCode,
    ...metadata,
  });
}

export function trackAuth(
  action: string,
  provider?: string,
  success: boolean = true,
  metadata?: MonitorPayload,
) {
  trackEvent(action, EVENT_CATEGORIES.AUTH, {
    provider,
    success,
    timestamp: new Date().toISOString(),
    ...metadata,
  }, {
    auth_action: action,
    auth_provider: provider || 'unknown',
    auth_success: success.toString(),
  });
}

export function startTransaction(name: string, op: string = 'custom') {
  emitMonitoringLog('transaction', { name, op });
  return {
    end: () => emitMonitoringLog('transaction:end', { name, op }),
  };
}

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
