import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://388fd3ecd8a41c61b6cf6c9e7f42e15d@o4509520271114240.ingest.us.sentry.io/4509520275701760',
  integrations: [Sentry.browserTracingIntegration()],
  // Capture front-end performance transactions
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Propagate traces to our API routes and deployed hostnames
  tracePropagationTargets: ['localhost', /^https:\/\/.*vercel\.app/, /^\/api\//],
  // Optional: JS profiling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});

// Instrument client-side navigations for better routing spans
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
