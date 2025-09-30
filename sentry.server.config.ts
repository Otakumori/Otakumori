import * as Sentry from '@sentry/nextjs';
import { env } from './env.mjs';

// Skip Sentry initialization during build
if (env.SENTRY_SKIP_AUTO_RELEASE !== 'true' && env.NEXT_PUBLIC_SENTRY_DSN) {
  // Guard against empty DSN
  const dsn = env.NEXT_PUBLIC_SENTRY_DSN;

  Sentry.init({
    dsn: dsn || undefined, // Don't initialize if empty string
    // Disable performance tracing to reduce build noise
    tracesSampleRate: 0,
    // Disable profiling to reduce build noise
    profilesSampleRate: 0,
    // Keep only essential integrations for error tracking
    integrations: [Sentry.httpIntegration()],
  });
}
