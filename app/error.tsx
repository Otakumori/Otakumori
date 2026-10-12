'use client';

import { logger } from '@/app/lib/logger';
import { useEffect } from 'react';
import Link from 'next/link';
import { getBrandedErrorMessage, getErrorType } from '@/app/lib/branded-errors';
import { RitualStatePage } from '@/app/components/system/RitualStatePage';

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
      logger.error('[Error Boundary] Full error details:', undefined, {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        name: error.name,
        cause: (error as any).cause,
        // Log all error properties
        ...Object.fromEntries(
          Object.entries(error).filter(
            ([key]) => !['message', 'stack', 'digest', 'name'].includes(key),
          ),
        ),
      });
    } else {
      logger.error(
        '[Error Boundary]',
        undefined,
        { 
          message: error.message,
          digest: error.digest ? `(digest: ${error.digest})` : ''
        },
        undefined
      );
    }
  }, [error]);

  const errorType = getErrorType(error);
  const errorMessage = getBrandedErrorMessage(errorType);

  return (
    <RitualStatePage
      description={errorMessage.message}
      state="error"
      title={errorMessage.title}
      action={
        <div className="ritual-system-actions">
          <button
            onClick={reset}
            className="mori-button-primary"
          >
            Try again
          </button>
          {errorMessage.cta && (
            <Link
              href={errorMessage.cta.href}
              className="mori-button-secondary"
            >
              {errorMessage.cta.label}
            </Link>
          )}
        </div>
      }
    />
  );
}
