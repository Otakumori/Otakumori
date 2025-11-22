/**
 * HomePageSafe - Safe wrapper for homepage content
 *
 * Provides comprehensive error handling and Sentry logging for the homepage.
 * Ensures the homepage never crashes the entire site, even if individual sections fail.
 */

import { Suspense, type ReactNode } from 'react';
import { headers } from 'next/headers';
import { handleServerError } from '@/app/lib/server-error-handler';
import { generateRequestId } from '@/app/lib/request-id';
import * as Sentry from '@sentry/nextjs';

interface HomePageSafeProps {
  children: ReactNode;
}

/**
 * Safe fallback UI when homepage fails to render
 */
function HomePageFallback() {
  return (
    <div className="relative min-h-screen page-transition" style={{ zIndex: 10 }}>
      <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center">
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight"
            style={{ color: '#835D75' }}
          >
            Welcome Home, Traveler
          </h1>
          <p className="mt-4 text-xl text-white/70 max-w-2xl mx-auto">
            Otaku - mori is stretching its petals…
          </p>
          <p className="mt-4 text-base text-white/60 max-w-xl mx-auto">
            The homepage hero had a hiccup.Shop, mini - games, and the rest of the site are still
            available from the navigation above while we tweak the front row.
          </p>
        </div>
      </section>
    </div>
  );
}

/**
 * HomePageSafe - Wraps homepage content with error boundaries and logging
 *
 * This component ensures that:
 * 1. Errors are caught and logged to Sentry with full context
 * 2. A graceful fallback is shown if the homepage fails
 * 3. The site never crashes due to homepage errors
 */
export default async function HomePageSafe({ children }: HomePageSafeProps) {
  // Generate request ID for error tracking
  let requestId: string;
  try {
    const headersList = await headers();
    requestId =
      headersList.get('x-request-id') || headersList.get('x-correlation-id') || generateRequestId();
  } catch {
    // Fallback if headers() fails
    requestId = generateRequestId();
  }

  try {
    // Wrap children in Suspense for async components
    return <Suspense fallback={<HomePageFallback />}>{children}</Suspense>;
  } catch (error) {
    // Log error with full context to Sentry
    handleServerError(
      error,
      {
        section: 'homepage',
        component: 'HomePageSafe',
        operation: 'render_homepage',
        metadata: {
          timestamp: new Date().toISOString(),
          nodeEnv: process.env.NODE_ENV,
          requestId,
        },
      },
      {
        logLevel: 'error',
        throwAfterLogging: false, // Don't throw - show fallback instead
        requestId,
      },
    );

    // Also capture in Sentry with additional context
    try {
      Sentry.captureException(error, {
        tags: {
          component: 'HomePageSafe',
          section: 'homepage',
          requestId,
        },
        contexts: {
          homepage: {
            error_type: error instanceof Error ? error.name : 'UnknownError',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        extra: {
          requestId,
          nodeEnv: process.env.NODE_ENV,
        },
      });
    } catch (sentryError) {
      // Silently fail if Sentry is unavailable
      if (typeof console !== 'undefined' && console.error) {
        console.error('[HomePageSafe] Failed to capture error in Sentry:', sentryError);
        console.error('[HomePageSafe] Original error:', error);
        console.error('[HomePageSafe] Request ID:', requestId);
      }
    }

    // Return fallback UI instead of crashing
    return <HomePageFallback />;
  }
}
