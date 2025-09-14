import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://388fd3ecd8a41c61b6cf6c9e7f42e15d@o4509520271114240.ingest.us.sentry.io/4509520275701760',
  // Capture server-side performance transactions
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Optional: enable native HTTP spans and profiling in Node
  integrations: [Sentry.httpIntegration()],
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});
