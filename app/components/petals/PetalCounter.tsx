'use client';

import { useState, useEffect } from 'react';
import { ANIMATION, UI } from '@/app/lib/petals/constants';

interface PetalCounterProps {
  count: number;
  lastValue?: number;
}

export default function PetalCounter({ count, lastValue = 1 }: PetalCounterProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [showMultiplier, setShowMultiplier] = useState(false);
  const [prevCount, setPrevCount] = useState(count);

  // Trigger pulse animation on count change
  useEffect(() => {
    if (count > prevCount) {
      setIsPulsing(true);

      // Show multiplier if it was a rare petal
      if (lastValue === 5) {
        setShowMultiplier(true);
        setTimeout(() => setShowMultiplier(false), 1000);
      }

      setTimeout(() => setIsPulsing(false), ANIMATION.COUNTER_PULSE);
      setPrevCount(count);
    }
  }, [count, prevCount, lastValue]);

  return (
    <button
      type="button"
      aria-label={`Petals collected: ${count}`}
      className={`
        fixed z-40 transition-all duration-500 cursor-default
        ${isPulsing ? 'scale-110' : 'scale-100'}
      `}
      style={{
        bottom: `${UI.COUNTER_BOTTOM_RIGHT_MARGIN}px`,
        right: `${UI.COUNTER_BOTTOM_RIGHT_MARGIN}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => e.preventDefault()}
    >
      <div
        className={`
          flex items-center gap-2 px-3 py-2
          bg-black/30 backdrop-blur-lg
          border border-pink-400/30 rounded-full
          transition-all duration-200
          ${isHovered ? 'w-[100px]' : 'w-[60px]'}
          ${isPulsing ? 'border-pink-400/60 shadow-lg shadow-pink-500/30' : ''}
        `}
      >
        {/* Cherry blossom icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0 text-pink-400"
        >
          <path
            d="M12 2C12 2 10 6 10 8C10 10 11 11 12 11C13 11 14 10 14 8C14 6 12 2 12 2Z"
            fill="currentColor"
          />
          <path
            d="M12 13C12 13 10 17 10 19C10 21 11 22 12 22C13 22 14 21 14 19C14 17 12 13 12 13Z"
            fill="currentColor"
          />
          <path
            d="M2 12C2 12 6 10 8 10C10 10 11 11 11 12C11 13 10 14 8 14C6 14 2 12 2 12Z"
            fill="currentColor"
          />
          <path
            d="M13 12C13 12 17 10 19 10C21 10 22 11 22 12C22 13 21 14 19 14C17 14 13 12 13 12Z"
            fill="currentColor"
          />
        </svg>

        {/* Count */}
        <span className="text-sm font-bold text-white/90 min-w-[20px]">{count}</span>

        {/* Label (shown on hover) */}
        {isHovered && (
          <span className="text-xs text-white/70 whitespace-nowrap overflow-hidden transition-all">
            Petals
          </span>
        )}
      </div>

      {/* Rare multiplier indicator */}
      {showMultiplier && (
        <div
          className="
            absolute -top-8 left-1/2 -translate-x-1/2
            text-yellow-400 font-bold text-lg
            animate-float-up pointer-events-none
          "
          style={{
            textShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
            animation: 'float-up 1s ease-out forwards',
          }}
        >
          +5
        </div>
      )}
    </button>
  );
}
