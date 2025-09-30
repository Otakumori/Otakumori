import * as Sentry from '@sentry/nextjs';
import { env } from './env.mjs';

// Skip Sentry initialization during build
if (env.SENTRY_SKIP_AUTO_RELEASE !== 'true' && env.NEXT_PUBLIC_SENTRY_DSN) {
  // Guard Sentry performance integrations from browser
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0, // Disable performance tracing in browser
    profilesSampleRate: 0, // Disable profiling in browser
    integrations: (defaults) =>
      defaults.filter(
        (i) => !('addPerformanceEntries' in i || i?.name?.includes('browserTracing')),
      ),
  });
}
