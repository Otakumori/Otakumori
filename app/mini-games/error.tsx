'use client';

import { logger } from '@/app/lib/logger';
import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Error boundary for mini-games route
 * Catches Server Component render errors and provides a graceful fallback UI
 */
export default function MiniGamesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging (only in dev or if Sentry is available)
    if (process.env.NODE_ENV === 'development') {
      logger.error('[MiniGamesError] Error boundary caught:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
  }, [error]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black flex items-center justify-center px-4">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Whoops, that spell misfired.
        </h1>
        <p className="text-lg text-white/70 mb-6">
          We hit an unexpected error loading the mini-games. Refresh or head back home while it's
          being patched.
        </p>
        {error.digest && (
          <p className="text-sm text-white/50 font-mono">Error ID: {error.digest}</p>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors border border-white/20"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
