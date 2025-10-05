'use client';

import { useEffect, useRef, useState } from 'react';

interface GameCubeBootOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function GameCubeBootOverlay({ onComplete, onSkip }: GameCubeBootOverlayProps) {
  const [isSkippable, setIsSkippable] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    // Initialize audio
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.4;
      audioRef.current.src = '/assets/sounds/gamecube-startup.mp3';
      audioRef.current.preload = 'auto';
    }

    // Allow skipping after 1.2s
    const skipTimer = setTimeout(() => {
      setIsSkippable(true);
    }, 1200);

    // Start the animation sequence
    if (!prefersReducedMotion) {
      // Play startup sound when ready
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {
            // Ignore audio play errors
          });
        }
      }, 800);

      // Complete after 3 seconds
      const completeTimer = setTimeout(() => {
        setIsComplete(true);
        onComplete();
      }, 3000);

      return () => {
        clearTimeout(skipTimer);
        clearTimeout(completeTimer);
      };
    } else {
      // Skip immediately for reduced motion
      setTimeout(() => {
        setIsComplete(true);
        onComplete();
      }, 500);
    }
  }, [onComplete, prefersReducedMotion]);

  const handleClick = () => {
    if (isSkippable) {
      setIsComplete(true);
      onSkip();
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (isSkippable && (event.key === ' ' || event.key === 'Enter' || event.key === 'Escape')) {
      event.preventDefault();
      setIsComplete(true);
      onSkip();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isSkippable]);

  if (isComplete) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
      onClick={handleClick}
      data-test="gc-boot-overlay"
      style={{
        background:
          'radial-gradient(ellipse at center, #8b2d69 0%, #6b1d4a 25%, #4a0033 50%, #2d0019 100%)',
      }}
    >
      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        GameCube-style boot animation loading. Press Space, Enter, or Escape to skip.
      </div>

      {/* GameCube Logo */}
      <div className="text-center">
        <div
          className="text-white font-bold text-6xl mb-4"
          style={{
            fontFamily: 'Orbitron, monospace',
            fontWeight: 900,
            textShadow: '0 0 20px rgba(236, 72, 153, 0.8)',
          }}
        >
          OTAKU-MORI™
        </div>
        <div className="text-pink-300 text-lg">
          {prefersReducedMotion ? 'Loading...' : 'Starting up...'}
        </div>
      </div>

      {/* Skip button */}
      {isSkippable && (
        <button
          className="absolute bottom-8 right-8 px-6 py-3 bg-pink-600/80 hover:bg-pink-600 text-white font-bold text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-pink-400/30"
          onClick={handleClick}
          aria-label="Skip boot animation"
        >
          Skip
        </button>
      )}
    </div>
  );
}
