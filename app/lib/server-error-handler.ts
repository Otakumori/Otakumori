/**
 * Server-Side Error Handling Utility
 * 
 * Comprehensive error handler for async server components with:
 * - Sentry error tracking with context
 * - Structured logging with request context
 * - Performance tracking
 * - Error classification and handling
 * - Safe error message extraction
 */

import { trackError } from '@/app/lib/monitoring';
import { logger, type LogCtx } from '@/app/lib/logger';

export interface ServerErrorContext {
  section: string;
  component: string;
  operation?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Comprehensive server-side error handler for async server components
 * 
 * Features:
 * - Sentry error tracking with context
 * - Structured logging with request context
 * - Performance tracking
 * - Error classification and handling
 * - Safe error message extraction
 */
export function handleServerError(
  error: unknown,
  context: ServerErrorContext,
  options?: {
    logLevel?: 'error' | 'warn' | 'info';
    throwAfterLogging?: boolean;
    requestId?: string;
  }
): void {
  const { logLevel = 'error', throwAfterLogging = false, requestId } = options || {};
  
  // Extract error details safely
  const errorDetails = error instanceof Error 
    ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      }
    : {
        name: 'UnknownError',
        message: String(error),
        stack: undefined,
        cause: undefined,
      };

  // Build Sentry context
  const sentryContext: Record<string, unknown> = {
    component: context.component,
    section: context.section,
    ...(context.operation && { operation: context.operation }),
    ...(context.metadata && { metadata: context.metadata }),
    timestamp: new Date().toISOString(),
  };

  // Track error in Sentry with enhanced context (defensive - never throw)
  try {
    trackError(
      error instanceof Error ? error : new Error(String(error)),
      sentryContext,
      {
        section: context.section,
        component: context.component,
        ...(context.operation && { operation: context.operation }),
      }
    );
  } catch (sentryError) {
    // Silently fail if Sentry tracking fails - don't crash the app
    // Fallback to console.error in case Sentry is unavailable
    if (typeof console !== 'undefined' && console.error) {
      console.error('[handleServerError] Failed to track error in Sentry:', sentryError);
    }
  }

  // Log to structured logger (defensive - never throw)
  const logContext: LogCtx = {
    requestId,
    route: `/${context.section}`,
    extra: {
      component: context.component,
      operation: context.operation,
      ...context.metadata,
    },
  };

  try {
    switch (logLevel) {
      case 'warn':
        logger.warn(
          `[${context.component}] ${context.operation || 'Operation'} failed: ${errorDetails.message}`,
          logContext,
          errorDetails
        );
        break;
      case 'info':
        logger.info(
          `[${context.component}] ${context.operation || 'Operation'} failed: ${errorDetails.message}`,
          logContext,
          errorDetails
        );
        break;
      default:
        logger.error(
          `[${context.component}] ${context.operation || 'Operation'} failed: ${errorDetails.message}`,
          logContext,
          errorDetails,
          error instanceof Error ? error : undefined
        );
    }
  } catch (loggerError) {
    // Silently fail if logger fails - don't crash the app
    // Fallback to console.error in case logger is unavailable
    if (typeof console !== 'undefined' && console.error) {
      console.error('[handleServerError] Failed to log error:', loggerError);
      console.error('[handleServerError] Original error:', errorDetails);
    }
  }

  // Re-throw if requested (for critical errors)
  if (throwAfterLogging) {
    throw error;
  }
}

/**
 * Wrapper for async server component operations with automatic error handling
 */
export async function withServerErrorHandling<T>(
  operation: () => Promise<T>,
  context: ServerErrorContext,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleServerError(error, {
      ...context,
      operation: context.operation || 'async_operation',
    });
    return fallback;
  }
}

