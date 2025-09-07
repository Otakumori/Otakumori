import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://388fd3ecd8a41c61b6cf6c9e7f42e15d@o4509520271114240.ingest.us.sentry.io/4509520275701760',
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  integrations: [],
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});

// This export will instrument router navigations, and is only relevant if you enable tracing.
// `captureRouterTransitionStart` is available from SDK version 9.12.0 onwards
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// Usage: Wrap your app with Sentry.ErrorBoundary for client-side error catching
// Example:
// <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
//   <App />
// </Sentry.ErrorBoundary>

// To test Sentry, add a button in your app:
// <button onClick={() => {throw new Error('This is your first error!')}}>Break the world</button>
