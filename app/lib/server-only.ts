import 'server-only';

/**
 * Server-only utility to prevent accidental client imports
 * Usage: import { assertServer } from '@/lib/server-only'; assertServer();
 */
export function assertServer() {
  // No-op marker function to ensure this code only runs on the server
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be called on the server');
  }
}

/**
 * Server-only exception capture utility
 */
export async function captureServerException(err: unknown) {
  assertServer();
  const Sentry = await import('@sentry/nextjs'); // Dynamic import to avoid client bundling
  Sentry.captureException(err);
}
