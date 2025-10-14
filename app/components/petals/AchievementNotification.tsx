'use client';

import { useEffect, useState } from 'react';
import { ANIMATION } from '@/app/lib/petals/constants';

interface AchievementNotificationProps {
  show: boolean;
  onDismiss: () => void;
}

export default function AchievementNotification({ show, onDismiss }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimatingOut(false);

      // Auto-dismiss after hold duration
      const timer = setTimeout(() => {
        setIsAnimatingOut(true);
        setTimeout(() => {
          setIsVisible(false);
          onDismiss();
        }, ANIMATION.ACHIEVEMENT_SLIDE_OUT);
      }, ANIMATION.ACHIEVEMENT_SLIDE_IN + ANIMATION.ACHIEVEMENT_HOLD);

      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-label="Achievement unlocked: Petal Collector"
      className={`fixed top-5 right-5 z-50 max-w-[320px] transition-all duration-250 ease-out ${isAnimatingOut ? 'translate-y-[-120%] opacity-0' : 'translate-y-0 opacity-100'} ${!isAnimatingOut && isVisible ? 'animate-slide-down' : ''}`}
      style={{
        transitionDuration: `${ANIMATION.ACHIEVEMENT_SLIDE_IN}ms`,
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-black/40 backdrop-blur-md border border-pink-300/30 rounded-xl shadow-lg">
        {/* Cherry blossom icon */}
        <div className="flex-shrink-0">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-pink-400"
          >
            <path
              d="M12 2C12 2 10 6 10 8C10 10 11 11 12 11C13 11 14 10 14 8C14 6 12 2 12 2Z"
              fill="currentColor"
              opacity="0.9"
            />
            <path
              d="M12 13C12 13 10 17 10 19C10 21 11 22 12 22C13 22 14 21 14 19C14 17 12 13 12 13Z"
              fill="currentColor"
              opacity="0.9"
            />
            <path
              d="M2 12C2 12 6 10 8 10C10 10 11 11 11 12C11 13 10 14 8 14C6 14 2 12 2 12Z"
              fill="currentColor"
              opacity="0.9"
            />
            <path
              d="M13 12C13 12 17 10 19 10C21 10 22 11 22 12C22 13 21 14 19 14C17 14 13 12 13 12Z"
              fill="currentColor"
              opacity="0.9"
            />
            <circle cx="12" cy="12" r="2" fill="#FFD700" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90">Petal Collector</p>
          <p className="text-xs text-white/70 mt-0.5">Collected your first cherry blossom petal</p>
        </div>

        {/* Badge */}
        <div
          className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-400/40 text-xs font-bold text-pink-300"
          style={{
            boxShadow: '0 0 12px rgba(236, 72, 153, 0.3)',
          }}
        >
          +1
        </div>
      </div>
    </div>
  );
}
