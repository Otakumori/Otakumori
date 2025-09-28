import * as Sentry from '@sentry/nextjs';

// Skip Sentry initialization during build
if (process.env.SENTRY_SKIP_AUTO_RELEASE !== 'true') {
  // Guard Sentry performance integrations from browser
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0, // Disable performance tracing in browser
    profilesSampleRate: 0, // Disable profiling in browser
    integrations: (defaults) =>
      defaults.filter(
        (i) => !('addPerformanceEntries' in i || i?.name?.includes('browserTracing')),
      ),
  });
}
