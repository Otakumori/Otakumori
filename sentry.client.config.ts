import * as Sentry from '@sentry/nextjs';
import { env } from './env.mjs';

/**
 * PII Scrubbing function to remove sensitive data from Sentry events
 */
function scrubPII(data: any): any {
  if (typeof data !== 'object' || data === null) return data;

  const sensitiveKeys = ['email', 'password', 'token', 'secret', 'key', 'ssn', 'phone'];
  const scrubbed = Array.isArray(data) ? [...data] : { ...data };

  for (const key in scrubbed) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      scrubbed[key] = '[REDACTED]';
    } else if (typeof scrubbed[key] === 'object') {
      scrubbed[key] = scrubPII(scrubbed[key]);
    }
  }

  return scrubbed;
}

// Skip Sentry initialization during build
if (env.SENTRY_SKIP_AUTO_RELEASE !== 'true' && env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 0, // 10% in production
    profilesSampleRate: 0, // Disable profiling
    integrations: (defaults) =>
      defaults.filter(
        (i) => !('addPerformanceEntries' in i || i?.name?.includes('browserTracing')),
      ),

    // PII Scrubbing
    beforeSend(event) {
      if (event.user) {
        event.user = scrubPII(event.user);
      }
      if (event.extra) {
        event.extra = scrubPII(event.extra);
      }
      if (event.tags) {
        event.tags = scrubPII(event.tags);
      }
      return event;
    },

    // Enhanced context
    initialScope: {
      tags: {
        component: 'client',
        version: process.env.npm_package_version || '1.0.0',
      },
    },

    // Filter out noise
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'ChunkLoadError',
    ],
  });
}
