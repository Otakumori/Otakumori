'use client';

import ErrorTestButton from '../components/ErrorTestButton';

);
}
export default function SentryDebugPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Sentry Error Testing</h1>
        <p className="text-gray-400 mb-8 text-center">
          Use the buttons below to test Sentry error tracking and reporting.
        </p>

        <ErrorTestButton />

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">What to expect:</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              • <strong>Sync Error:</strong> Will throw an error immediately and trigger the error
              boundary
            </li>
            <li>
              • <strong>Async Error:</strong> Will throw an error in an async function
            </li>
            <li>
              • <strong>Custom Error:</strong> Will capture an error directly using
              Sentry.captureException
            </li>
            <li>
              • <strong>Test Message:</strong> Will send a custom message to Sentry
            </li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-blue-300">Check Sentry Dashboard</h3>
          <p className="text-sm text-blue-200">
            After clicking the buttons, check your Sentry dashboard at{' '}
            <a
              href="https://sentry.io"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-100"
            >
              sentry.io
            </a>{' '}
            to see the captured errors and messages.
          </p>
        </div>
      </div>
    </div>
  );
}
