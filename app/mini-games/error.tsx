'use client';

import { useEffect } from 'react';
import Link from 'next/link';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

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
      getLogger().then((logger) => {
        logger.error('[MiniGamesError] Error boundary caught:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      });
    }
  }, [error]);

  return (
    <main className="om-route-page om-route-page--games flex min-h-screen items-center justify-center px-4">
      <section className="om-route-state om-route-state--bounded om-route-state--error">
        <span aria-hidden="true" className="om-route-state__mark" />
        <p className="mori-foundation-eyebrow">Portal threshold</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-[#f6eddf]">Mini-games are temporarily unavailable</h1>
        <p className="mt-4 text-sm leading-7 text-[#d9cdbd]">
          We couldn&apos;t open this part of Otaku-mori. Try again, or return to a safe destination.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="mori-button-primary"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="mori-button-secondary"
          >
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
