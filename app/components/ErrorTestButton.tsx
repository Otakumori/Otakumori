'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';

export default function ErrorTestButton() {
  const throwSyncError = () => {
    throw new Error('Sentry Frontend Error: This is a synchronous test error!');
  };

  const throwAsyncError = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    throw new Error('Sentry Frontend Error: This is an asynchronous test error!');
  };

  const captureCustomError = () => {
    try {
      // Simulate an error that might not be caught by React's error boundary
      // or is a non-fatal issue we still want to track.
      const data = null;
      // @ts-ignore
      console.log(data.property); // This will throw a TypeError
    } catch (error) {
      Sentry.captureException(error);
      console.error('Custom error captured by Sentry:', error);
      alert('Custom error captured by Sentry. Check your Sentry dashboard.');
    }
  };

  const sendTestMessage = () => {
    Sentry.captureMessage('Sentry Frontend Message: This is a test message!');
    alert('Test message sent to Sentry. Check your Sentry dashboard.');
  };

  return (
    <div className="flex flex-col space-y-4 p-4 rounded-lg bg-gray-800">
      <button
        onClick={throwSyncError}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Throw Sync Error
      </button>
      <button
        onClick={throwAsyncError}
        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
      >
        Throw Async Error
      </button>
      <button
        onClick={captureCustomError}
        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
      >
        Capture Custom Error
      </button>
      <button
        onClick={sendTestMessage}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Send Test Message
      </button>
    </div>
  );
}
