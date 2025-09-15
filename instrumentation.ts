// Temporarily disabled to fix DATABASE_URL validation issue
// import { env } from '@/env';

export async function register() {
  // Temporarily disabled to fix DATABASE_URL validation issue
  // if (env.NEXT_RUNTIME === 'nodejs') {
  //   await import('./app/sentry.server.config');
  // }
  // Temporarily disable edge runtime to fix build issues
  // if (env.NEXT_RUNTIME === 'edge') {
  //   await import('./sentry.edge.config');
  // }
}
