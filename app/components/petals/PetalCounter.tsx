'use client';

import { useState, useEffect, useMemo, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION, UI } from '@/app/lib/petals/constants';

interface PetalCounterProps {
  count: number;
  lastValue?: number;
}

function PetalCounterComponent({ count, lastValue = 1 }: PetalCounterProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [showMultiplier, setShowMultiplier] = useState(false);
  const [prevCount, setPrevCount] = useState(count);
  const [displayCount, setDisplayCount] = useState(count);
  const animationFrameRef = useRef<number | null>(null);

  // Smooth number animation
  useEffect(() => {
    if (count !== displayCount) {
      const diff = count - displayCount;
      const duration = 300; // ms
      const startTime = Date.now();
      const startValue = displayCount;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(startValue + diff * easeOut);

        setDisplayCount(current);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayCount(count); // Ensure final value is exact
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [count, displayCount]);

  // Trigger pulse on count change
  useEffect(() => {
    if (count > prevCount) {
      setIsPulsing(true);

      if (lastValue === 5) {
        setShowMultiplier(true);
        setTimeout(() => setShowMultiplier(false), 1500);
      }

      setTimeout(() => setIsPulsing(false), ANIMATION.COUNTER_PULSE);
      setPrevCount(count);
    }
  }, [count, prevCount, lastValue]);

  const formattedCount = useMemo(() => {
    return displayCount.toLocaleString();
  }, [displayCount]);

  return (
    <motion.button
      type="button"
      aria-label={`Petals collected: ${displayCount}`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed z-50 cursor-default outline-none focus:ring-2 focus:ring-pink-400/50 focus:ring-offset-2 focus:ring-offset-black/50 rounded-full"
      style={{
        bottom: `${UI.COUNTER_BOTTOM_RIGHT_MARGIN}px`,
        right: `${UI.COUNTER_BOTTOM_RIGHT_MARGIN}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => e.preventDefault()}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)',
        }}
        animate={{
          scale: isPulsing ? [1, 1.3, 1] : 1,
          opacity: isPulsing ? [0.6, 0.9, 0.6] : 0.6,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Main container */}
      <motion.div
        className={`
          relative flex items-center gap-2.5 px-4 py-2.5
          bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-pink-500/20
          backdrop-blur-xl backdrop-saturate-150
          border border-pink-400/40 rounded-full
          shadow-2xl shadow-pink-500/20
          transition-all duration-300
          ${isHovered ? 'w-auto border-pink-400/60' : 'w-[70px]'}
          ${isPulsing ? 'ring-4 ring-pink-400/50 ring-offset-2 ring-offset-black/50' : ''}
        `}
        animate={{
          scale: isPulsing ? [1, 1.08, 1] : 1,
          boxShadow: isPulsing
            ? [
                '0 0 20px rgba(236,72,153,0.3)',
                '0 0 40px rgba(236,72,153,0.6)',
                '0 0 20px rgba(236,72,153,0.3)',
              ]
            : '0 10px 40px rgba(236,72,153,0.2)',
        }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon */}
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="flex-shrink-0 text-pink-300"
          animate={{
            rotate: isPulsing ? [0, 15, -15, 0] : 0,
            scale: isPulsing ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          <path
            d="M12 2C12 2 10 6 10 8C10 10 11 11 12 11C13 11 14 10 14 8C14 6 12 2 12 2Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M12 13C12 13 10 17 10 19C10 21 11 22 12 22C13 22 14 21 14 19C14 17 12 13 12 13Z"
            fill="currentColor"
            opacity="0.7"
          />
          <path
            d="M2 12C2 12 6 10 8 10C10 10 11 11 11 12C11 13 10 14 8 14C6 14 2 12 2 12Z"
            fill="currentColor"
            opacity="0.8"
          />
          <path
            d="M13 12C13 12 17 10 19 10C21 10 22 11 22 12C22 13 21 14 19 14C17 14 13 12 13 12Z"
            fill="currentColor"
            opacity="0.8"
          />
        </motion.svg>

        {/* Count */}
        <motion.span
          key={displayCount}
          className="text-base font-bold text-white tabular-nums min-w-[30px] text-right"
          style={{
            textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(236,72,153,0.4)',
          }}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {formattedCount}
        </motion.span>

        {/* Label */}
        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-pink-200/80 whitespace-nowrap overflow-hidden font-medium"
            >
              Petals
            </motion.span>
          )}
        </AnimatePresence>

        {/* Subtle shimmer effect */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
          initial={{ x: '-100%' }}
          animate={{
            x: isPulsing ? ['100%', '200%'] : '-100%',
          }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>
      </motion.div>

      {/* Rare multiplier indicator */}
      <AnimatePresence>
        {showMultiplier && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -40 }}
            exit={{ opacity: 0, scale: 0.5, y: -60 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400/90 to-orange-400/90 backdrop-blur-sm border border-yellow-300/50 shadow-lg">
              <span className="text-yellow-200 font-bold text-sm">+{lastValue}</span>
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
                className="text-lg"
                role="img"
                aria-label="Star"
              >
                <span>⭐</span>
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default memo(PetalCounterComponent);
