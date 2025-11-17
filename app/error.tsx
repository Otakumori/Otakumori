'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { getBrandedErrorMessage, getErrorType } from '@/app/lib/branded-errors';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Enhanced error logging for development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Boundary] Full error details:', {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        name: error.name,
        cause: (error as any).cause,
        // Log all error properties
        ...Object.fromEntries(
          Object.entries(error).filter(([key]) => !['message', 'stack', 'digest', 'name'].includes(key))
        ),
      });
    } else {
      console.error('[Error Boundary]', error.message, error.digest ? `(digest: ${error.digest})` : '');
    }
  }, [error]);

  const errorType = getErrorType(error);
  const errorMessage = getBrandedErrorMessage(errorType, {
    customMessage: error.message,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080611]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_50%_35%,#1a0f2a,#120b1f_40%,#080611_100%)]" />
      <div className="rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-8 text-center max-w-md mx-4">
        <h2 className="mb-4 text-2xl md:text-3xl font-bold text-pink-300">{errorMessage.title}</h2>
        <p className="mb-6 text-zinc-300">{errorMessage.message}</p>
        <div className="flex gap-4 justify-center">
        <button
          onClick={reset}
            className="rounded-xl bg-pink-500/90 px-6 py-3 text-white hover:bg-pink-500 transition-colors"
        >
          Try again
        </button>
          {errorMessage.cta && (
            <Link
              href={errorMessage.cta.href}
              className="rounded-xl bg-white/10 px-6 py-3 text-white hover:bg-white/20 transition-colors border border-white/20"
            >
              {errorMessage.cta.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
