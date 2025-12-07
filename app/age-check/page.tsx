'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AgeCheckPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnTo = searchParams.get('returnTo') || '/';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/age/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnTo }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to confirm age');
      }

      // Redirect to the original destination
      window.location.assign(data.data.redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleDecline = () => {
    router.push('/');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-black p-6">
      <div className="w-full max-w-md">
        {/* Glass card */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Warning icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/20 border border-pink-500/30">
              <svg
                className="h-8 w-8 text-pink-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-center text-2xl font-bold text-white">
            Age Verification Required
          </h1>

          {/* Description */}
          <p className="mb-6 text-center text-zinc-300">
            This content is intended for adults only. By continuing, you confirm that you are 18
            years of age or older.
          </p>

          {/* Warning notice */}
          <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p className="text-sm text-yellow-200">
              <strong className="font-semibold">Content Warning:</strong> This area may contain
              adult themes, suggestive content, and mature gameplay elements.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full rounded-xl bg-pink-500 px-6 py-3 font-semibold text-white transition-all hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-purple-900 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Confirm you are 18 or older"
            >
              {loading ? 'Confirming...' : "I'm 18 or Older"}
            </button>

            <button
              onClick={handleDecline}
              disabled={loading}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-purple-900 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Go back to home page"
            >
              Go Back
            </button>
          </div>

          {/* Legal notice */}
          <p className="mt-6 text-center text-xs text-zinc-400">
            This verification is required by our Terms of Service. Your confirmation is stored for
            this browser session only.
          </p>
        </div>
      </div>
    </main>
  );
}
