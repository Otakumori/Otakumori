'use client';

import * as Sentry from '@sentry/nextjs';
import React from 'react';

export default function ClientErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-pink-400 mb-4">Something went wrong</h1>
            <p className="text-zinc-300">
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
            </p>
          </div>
        </div>
      }
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
