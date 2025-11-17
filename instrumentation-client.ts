import * as Sentry from '@sentry/nextjs';
import { env } from './env.mjs';

// NOTE: PostHog initialization has been moved to PostHogProvider.safe.tsx
// to prevent double initialization errors. Do NOT call posthog.init() here.
// The PostHogProvider component handles all initialization in a single, controlled location.

if (env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,

    integrations: [
      Sentry.browserTracingIntegration(),
      // Optional: Replay (great context for errors)
      // Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],

    // Performance tracing
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Propagate traces to API + your domains
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/.*vercel\.app$/,
      /^https:\/\/(www\.)?otaku-mori\.com$/,
      /^\/api\//,
    ],

    // JS profiling (browser)
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Optional: Replay sampling (uncomment if using replayIntegration above)
    // replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
    // replaysOnErrorSampleRate: 1.0,

    // PII (ensure policy covers this)
    sendDefaultPii: true,
  });
}

// Instrument client-side navigations for better routing spans
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
