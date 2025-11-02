'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AgeGateModalProps {
  targetPath: string;
  onClose: () => void;
}

export default function AgeGateModal({ targetPath, onClose }: AgeGateModalProps) {
  const router = useRouter();
  const [reducedMotion, setReducedMotion] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    // Check sessionStorage to avoid showing repeatedly
    const hasSeenWarning = sessionStorage.getItem('om_age_warned');
    if (hasSeenWarning) {
      // User has seen the warning before in this session, proceed directly
      router.push(`/age-check?returnTo=${encodeURIComponent(targetPath)}`);
      return;
    }

    // Focus trap: focus the close button on mount
    closeButtonRef.current?.focus();

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [targetPath, router, onClose]);

  const handleContinue = () => {
    // Set sessionStorage flag to avoid showing modal repeatedly
    sessionStorage.setItem('om_age_warned', '1');
    router.push(`/age-check?returnTo=${encodeURIComponent(targetPath)}`);
  };

  const handleCancel = () => {
    sessionStorage.setItem('om_age_warned', '1');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 relative"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-transparent"
        aria-label="Dismiss age gate"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClose();
          }
        }}
      />
      <div
        ref={dialogRef}
        className={`relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl ${
          reducedMotion ? '' : 'animate-in fade-in zoom-in-95 duration-200'
        }`}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {/* Warning icon */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/20 border border-pink-500/30">
            <svg
              className="h-6 w-6 text-pink-400"
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
        <h2 id="age-gate-title" className="mb-3 text-center text-xl font-bold text-white">
          Adult Content Warning
        </h2>

        {/* Description */}
        <p className="mb-4 text-center text-sm text-zinc-300">
          The page you're about to visit may contain adult content. You must be 18 or older to
          continue.
        </p>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleContinue}
            className="flex-1 rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label="Continue to age verification"
          >
            Continue
          </button>

          <button
            ref={closeButtonRef}
            onClick={handleCancel}
            className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label="Cancel and go back"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

