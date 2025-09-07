import { env } from '@/env';

export async function register() {
  if (env.NEXT_RUNTIME === 'nodejs') {
    await import('./app/sentry.server.config');
  }

  // Temporarily disable edge runtime to fix build issues
  // if (env.NEXT_RUNTIME === 'edge') {
  //   await import('./sentry.edge.config');
  // }
}
