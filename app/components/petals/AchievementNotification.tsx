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
      <div
        className="flex items-center gap-3 rounded-xl border border-[#e8c8b5]/28 bg-[#170d12]/78 px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.3)] backdrop-blur-[5px]"
        data-reward-token-state="visual-qa-placeholder"
      >
        <span className="h-10 w-px shrink-0 bg-gradient-to-b from-transparent via-[#e8c8b5]/62 to-transparent" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-ui text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#f4d2c4]/72">
            First petal
          </p>
          <p className="mt-0.5 text-sm font-medium text-[#fff2e7]">Petal Collector</p>
          <p className="mt-0.5 text-xs text-[#f4ddd3]/72">Your wallet now holds one gathered petal.</p>
        </div>
        <span className="font-ui shrink-0 border-l border-[#e8c8b5]/22 pl-3 text-sm font-semibold text-[#fff1e4]">
          +1
        </span>
      </div>
    </div>
  );
}
