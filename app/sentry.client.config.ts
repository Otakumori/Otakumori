import * as Sentry from '@sentry/nextjs';
import { Replay } from '@sentry/replay';

Sentry.init({
  dsn: 'https://388fd3ecd8a41c61b6cf6c9e7f42e15d@o4509520271114240.ingest.us.sentry.io/4509520275701760',
  sendDefaultPii: true,
  tracesSampleRate: 1.0, // Adjust for production
  integrations: [new Replay()],
  // You can add more options here (release, environment, etc.)
});

// Usage: Wrap your app with Sentry.ErrorBoundary for client-side error catching
// Example:
// <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
//   <App />
// </Sentry.ErrorBoundary>

// To test Sentry, add a button in your app:
// <button onClick={() => {throw new Error('This is your first error!')}}>Break the world</button>
