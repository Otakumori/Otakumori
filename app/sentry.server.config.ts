/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0, // Adjust for production
  // You can add more options here (release, environment, etc.)
});

// Usage: In API routes or server code, use Sentry.captureException(error) to log errors.
