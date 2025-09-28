import * as Sentry from '@sentry/nextjs';
import { env } from './env.mjs';

// Skip Sentry initialization during build
if (process.env.SENTRY_SKIP_AUTO_RELEASE !== 'true') {
  // Guard against empty DSN
  const dsn =
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    'https://388fd3ecd8a41c61b6cf6c9e7f42e15d@o4509520271114240.ingest.us.sentry.io/4509520275701760';

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
