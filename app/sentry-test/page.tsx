'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function SentryTestPage() {
  useEffect(() => {
    // Trigger errors immediately when page loads
    console.log('🚨 Triggering Sentry test errors...');

    // Test 1: Throw an error
    setTimeout(() => {
      console.log('Throwing test error...');
      throw new Error('Sentry Test Error - This should appear in your dashboard!');
    }, 1000);

    // Test 2: Capture a message
    console.log('Sending test message...');
    Sentry.captureMessage('Sentry Test Message - This should appear in your dashboard!', 'info');

    // Test 3: Capture an exception
    console.log('Capturing test exception...');
    Sentry.captureException(
      new Error('Sentry Test Exception - This should appear in your dashboard!'),
    );
  }, []);

  const triggerError = () => {
    console.log('Manual error triggered!');
    throw new Error('Manual Sentry Test Error!');
  };

  const triggerAsyncError = async () => {
    console.log('Async error triggered!');
    throw new Error('Async Sentry Test Error!');
  };

  const sendMessage = () => {
    console.log('Message sent!');
    Sentry.captureMessage('Manual Sentry Test Message!', 'warning');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-red-400">
          🚨 Sentry Error Testing
        </h1>

        <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-red-300">✅ Errors Already Triggered!</h2>
          <p className="text-red-200 mb-4">
            When this page loaded, it automatically triggered 3 test events:
          </p>
          <ul className="list-disc list-inside space-y-2 text-red-200">
            <li>
              <strong>Thrown Error:</strong> "Sentry Test Error - This should appear in your
              dashboard!"
            </li>
            <li>
              <strong>Captured Message:</strong> "Sentry Test Message - This should appear in your
              dashboard!"
            </li>
            <li>
              <strong>Captured Exception:</strong> "Sentry Test Exception - This should appear in
              your dashboard!"
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={triggerError}
            className="px-6 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold text-lg"
          >
            🔥 Trigger Error
          </button>

          <button
            onClick={triggerAsyncError}
            className="px-6 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-lg"
          >
            ⚡ Async Error
          </button>

          <button
            onClick={sendMessage}
            className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-lg"
          >
            📨 Send Message
          </button>
        </div>

        <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-300">
            🎯 Check Your Sentry Dashboard
          </h3>
          <p className="text-green-200 mb-4">
            Go to your Sentry project dashboard and look for these test events:
          </p>
          <div className="space-y-2 text-sm text-green-200">
            <p>
              • <strong>Issues:</strong> Look for the test errors
            </p>
            <p>
              • <strong>Performance:</strong> Check for transaction data
            </p>
            <p>
              • <strong>Releases:</strong> Verify release tracking is working
            </p>
          </div>
          <a
            href="https://sentry.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Open Sentry Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
}
