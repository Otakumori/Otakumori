import * as Sentry from '@sentry/nextjs';
import { env } from './env.mjs';

/**
 * Enhanced PII Scrubbing for server-side events
 */
function scrubServerPII(data: any): any {
  if (typeof data !== 'object' || data === null) return data;

  const sensitiveKeys = [
    'email',
    'password',
    'token',
    'secret',
    'key',
    'ssn',
    'phone',
    'apiKey',
    'privateKey',
    'sessionId',
    'authToken',
    'refreshToken',
    'stripeKey',
    'clerkKey',
    'databaseUrl',
  ];

  const scrubbed = Array.isArray(data) ? [...data] : { ...data };

  for (const key in scrubbed) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      scrubbed[key] = '[REDACTED]';
    } else if (typeof scrubbed[key] === 'object') {
      scrubbed[key] = scrubServerPII(scrubbed[key]);
    }
  }

  return scrubbed;
}

// Skip Sentry initialization during build
if (env.SENTRY_SKIP_AUTO_RELEASE !== 'true' && env.NEXT_PUBLIC_SENTRY_DSN) {
  const dsn = env.NEXT_PUBLIC_SENTRY_DSN;

  Sentry.init({
    dsn: dsn || undefined,
    environment: env.NODE_ENV,
    // Tracing disabled: omit tracesSampleRate entirely so it doesn't initialize
    // (we also tree-shake tracing via __SENTRY_TRACING__ = false in next.config)
    skipOpenTelemetrySetup: true, // Prevent OTEL conflicts in bundling

    integrations: [
      Sentry.httpIntegration(),
      Sentry.prismaIntegration(),
      Sentry.nodeContextIntegration(),
    ],

    // Enhanced PII Scrubbing
    beforeSend(event) {
      // Scrub user data
      if (event.user) {
        event.user = scrubServerPII(event.user);
      }

      // Scrub extra context
      if (event.extra) {
        event.extra = scrubServerPII(event.extra);
      }

      // Scrub tags
      if (event.tags) {
        event.tags = scrubServerPII(event.tags);
      }

      // Scrub request data
      if (event.request) {
        event.request = scrubServerPII(event.request);
      }

      return event;
    },

    // Enhanced context
    initialScope: {
      tags: {
        component: 'server',
        version: process.env.npm_package_version || '1.0.0',
        runtime: 'nodejs',
      },
    },

    // Filter out noise
    ignoreErrors: ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'],
  });
}
