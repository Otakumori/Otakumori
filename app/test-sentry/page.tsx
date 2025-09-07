'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function TestSentryPage() {
  useEffect(() => {
    // Trigger a client-side error immediately when the page loads
    console.log('Triggering test error for Sentry...');

    // Method 1: Throw an error
    setTimeout(() => {
      throw new Error('First Sentry test error - client side!');
    }, 1000);

    // Method 2: Capture a message
    Sentry.captureMessage('First Sentry test message - client side!', 'info');

    // Method 3: Capture an exception directly
    Sentry.captureException(new Error('First Sentry test exception - client side!'));
  }, []);

  const triggerError = () => {
    throw new Error('Manual error trigger for Sentry!');
  };

  const triggerAsyncError = async () => {
    throw new Error('Async error trigger for Sentry!');
  };

  return (
    <div className="min-h-screen bg-[#080611] text-zinc-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-fuchsia-400">Sentry Test Page</h1>

        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-red-300">
            🚨 Errors have been automatically triggered!
          </h2>
          <p className="text-red-200 mb-4">
            This page automatically triggered several test errors when it loaded:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-200">
            <li>Thrown error (after 1 second delay)</li>
            <li>Captured message</li>
            <li>Captured exception</li>
          </ul>
        </div>

        <div className="space-y-4">
          <button
            onClick={triggerError}
            className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            Trigger Manual Error
          </button>

          <button
            onClick={triggerAsyncError}
            className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Trigger Async Error
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-blue-300">
            ✅ Check Your Sentry Dashboard
          </h3>
          <p className="text-blue-200 text-sm">
            Go to{' '}
            <a
              href="https://sentry.io"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-100"
            >
              sentry.io
            </a>{' '}
            and check your project dashboard. You should see the test errors and messages appear
            there.
          </p>
        </div>
      </div>
    </div>
  );
}
