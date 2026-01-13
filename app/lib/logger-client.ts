/**
 * Client-side logger utility
 * Provides dynamic import of logger to avoid bundling server-side code in client components
 */

export async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

/**
 * Synchronous logger access for client components
 * Use this when you need logger in a non-async context
 * Note: This will still dynamically import, but returns a promise
 */
export function getLoggerSync() {
  return import('@/app/lib/logger').then((m) => m.logger);
}

