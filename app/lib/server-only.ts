import 'server-only';

/**
 * Server-only utility to prevent accidental client imports.
 * Usage: import { assertServer } from '@/app/lib/server-only'; assertServer();
 */
export function assertServer() {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be called on the server');
  }
}

/**
 * Server-only exception capture utility.
 *
 * Keep this helper dependency-light. Importing Sentry here pulls server-side
 * OpenTelemetry instrumentation into every route that imports this shared file.
 */
export async function captureServerException(err: unknown) {
  assertServer();
  console.error('Server exception captured:', err);
}
