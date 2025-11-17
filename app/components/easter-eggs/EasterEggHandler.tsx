'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  EASTER_EGGS,
  findEasterEggByPattern,
  markEasterEggDiscovered,
  isEasterEggDiscovered,
} from '@/app/lib/easter-eggs';

interface EasterEggHandlerProps {
  children: React.ReactNode;
}

/**
 * Global easter egg handler component
 * Detects triggers and activates easter eggs
 */
export function EasterEggHandler({ children }: EasterEggHandlerProps) {
  const searchParams = useSearchParams();
  const [activeEgg, setActiveEgg] = useState<string | null>(null);
  const konamiSequence = useRef<string[]>([]);
  const clickSequence = useRef<number[]>([]);
  const lastClickTime = useRef<number>(0);

  // Check URL-based easter eggs
  useEffect(() => {
    const debug = searchParams.get('debug');
    if (debug === 'true') {
      const egg = findEasterEggByPattern('url', 'debug=true');
      if (egg) {
        activateEasterEgg(egg);
      }
    }
  }, [searchParams]);

  // Check time-based easter eggs
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      const egg = findEasterEggByPattern('time', timeString);
      if (egg && !isEasterEggDiscovered(egg.id)) {
        activateEasterEgg(egg);
      }
    };

    const interval = setInterval(checkTime, 60000); // Check every minute
    checkTime(); // Initial check

    return () => clearInterval(interval);
  }, []);

  // Keyboard handler for Konami code
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      konamiSequence.current.push(key);

      // Keep only last 10 keys
      if (konamiSequence.current.length > 10) {
        konamiSequence.current.shift();
      }

      const sequence = konamiSequence.current.join(',');
      const egg = findEasterEggByPattern('keyboard', sequence);
      if (egg) {
        activateEasterEgg(egg);
        konamiSequence.current = []; // Reset sequence
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click sequence handler
  useEffect(() => {
    const handleClick = () => {
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime.current;

      // Reset sequence if too much time passed (2 seconds)
      if (timeSinceLastClick > 2000) {
        clickSequence.current = [];
      }

      clickSequence.current.push(clickSequence.current.length + 1);
      lastClickTime.current = now;

      // Check for click sequence patterns
      const egg = findEasterEggByPattern('click_sequence', clickSequence.current);
      if (egg) {
        activateEasterEgg(egg);
        clickSequence.current = []; // Reset sequence
      }

      // Keep sequence reasonable length
      if (clickSequence.current.length > 20) {
        clickSequence.current.shift();
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const activateEasterEgg = (egg: any) => {
    if (egg.oneTimeOnly && isEasterEggDiscovered(egg.id)) {
      return;
    }

    markEasterEggDiscovered(egg.id);
    setActiveEgg(egg.id);

    // Show notification
    if (egg.reward === 'message') {
      // Notification shown in UI below
    }

    // Handle different reward types
    switch (egg.reward) {
      case 'feature':
        // Enable developer mode or special feature
        if (egg.id === 'konami_code') {
          // Could set a feature flag or enable debug mode
        }
        break;
      case 'unlock':
        // Unlock content (could trigger API call)
        break;
      case 'achievement':
        // Grant achievement (could trigger API call)
        break;
    }

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setActiveEgg(null);
    }, 5000);
  };

  return (
    <>
      {children}
      {activeEgg && (
        <div
          className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in"
          role="alert"
        >
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-lg border border-pink-500/30 rounded-xl p-4 shadow-lg">
            <p className="text-white font-semibold">
              {EASTER_EGGS.find((e) => e.id === activeEgg)?.message}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

