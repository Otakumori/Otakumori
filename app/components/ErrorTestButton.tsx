'use client';

import * as Sentry from '@sentry/nextjs';

// Add this button component to your app to test Sentry's error tracking
export default function ErrorTestButton() {
  const handleError = () => {
    throw new Error('This is your first error!');
  };

  const handleAsyncError = async () => {
    throw new Error('This is an async error!');
  };

  const handleCustomError = () => {
    Sentry.captureException(new Error('Custom error captured directly!'));
  };

  const handleMessage = () => {
    Sentry.captureMessage('Test message from ErrorTestButton', 'info');
  };

  return (
    <div className="space-y-4 p-4 border border-red-500 rounded-lg bg-red-50 dark:bg-red-900/20">
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">Sentry Error Testing</h3>
      <div className="space-y-2">
        <button
          onClick={handleError}
          className="block w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Break the world (Sync Error)
        </button>
        <button
          onClick={handleAsyncError}
          className="block w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          Break the world (Async Error)
        </button>
        <button
          onClick={handleCustomError}
          className="block w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          Capture Custom Error
        </button>
        <button
          onClick={handleMessage}
          className="block w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Send Test Message
        </button>
      </div>
      <p className="text-sm text-red-600 dark:text-red-400">
        ⚠️ These buttons will trigger errors for testing Sentry integration
      </p>
    </div>
  );
}
