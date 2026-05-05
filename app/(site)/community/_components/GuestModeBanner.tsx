'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { X } from 'lucide-react';
import { SignInButton } from '@clerk/nextjs';

export function GuestModeBanner() {
  const { isSignedIn } = useUser();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if signed in or dismissed
  if (isSignedIn || dismissed) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-amber-500/50 bg-amber-500/10 backdrop-blur-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-amber-200">
            <strong className="font-semibold">Guest Mode:</strong> Sign in to save avatars and sync them to games. Right now you're in guest mode.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <button className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-600">
              Sign In
            </button>
          </SignInButton>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg p-2 text-amber-200 transition-colors hover:bg-amber-500/20"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

