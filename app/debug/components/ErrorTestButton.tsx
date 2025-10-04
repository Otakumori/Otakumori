'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function ErrorTestButton() {
  const [isLoading, setIsLoading] = useState(false);

  const throwSyncError = () => {
    setIsLoading(true);
    try {
      // This will throw a synchronous error
      throw new Error('Test synchronous error for Sentry');
    } catch (error) {
      Sentry.captureException(error);
      throw error; // Re-throw to trigger error boundary
    } finally {
      setIsLoading(false);
    }
  };

  const throwAsyncError = async () => {
    setIsLoading(true);
    try {
      // Simulate an async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Test asynchronous error for Sentry'));
        }, 1000);
      });
    } catch (error) {
      Sentry.captureException(error);
      throw error; // Re-throw to trigger error boundary
    } finally {
      setIsLoading(false);
    }
  };

  const throwCustomError = () => {
    setIsLoading(true);
    try {
      // Create a custom error with additional context
      const customError = new Error('Test custom error for Sentry');
      customError.name = 'CustomTestError';

      // Add custom context to Sentry
      Sentry.withScope((scope) => {
        scope.setTag('errorType', 'custom');
        scope.setContext('testContext', {
          timestamp: new Date().toISOString(),
          userAction: 'debug_test',
          testId: Math.random().toString(36).substring(7),
        });
        scope.setLevel('error');
        Sentry.captureException(customError);
      });

      throw customError;
    } catch (error) {
      throw error; // Re-throw to trigger error boundary
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = () => {
    setIsLoading(true);
    try {
      // Send a custom message to Sentry
      Sentry.captureMessage('Test message from Sentry debug page', 'info');

      // Also send with additional context
      Sentry.withScope((scope) => {
        scope.setTag('messageType', 'test');
        scope.setContext('debugInfo', {
          page: 'sentry-debug',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
        scope.setLevel('info');
        Sentry.captureMessage('Test message with context from Sentry debug page', 'info');
      });

      alert('Test message sent to Sentry! Check your Sentry dashboard.');
    } catch (error) {
      console.error('Error sending test message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={throwSyncError}
          disabled={isLoading}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? 'Testing...' : 'Throw Sync Error'}
        </button>

        <button
          onClick={throwAsyncError}
          disabled={isLoading}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? 'Testing...' : 'Throw Async Error'}
        </button>

        <button
          onClick={throwCustomError}
          disabled={isLoading}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? 'Testing...' : 'Throw Custom Error'}
        </button>

        <button
          onClick={sendTestMessage}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? 'Sending...' : 'Send Test Message'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-yellow-300"> Warning</h3>
        <p className="text-sm text-yellow-200">
          These buttons will trigger actual errors and send data to Sentry. Only use this page for
          testing purposes. Make sure you have Sentry properly configured before testing.
        </p>
      </div>
    </div>
  );
}
