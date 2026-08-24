'use client';

import { useState, useEffect, useMemo, memo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import { ANIMATION, COLLECTION, UI } from '@/app/lib/petals/constants';
import { HOME_SCENE_MANIFEST, resolvePetalSpritePosition } from '@/app/components/hero/homeScene';
import { isVisualQaAuthEnabled, resolveVisualQaAuthState } from '@/app/lib/visual-qa/mode';

interface PetalCounterProps {
  count: number;
  lastValue?: number;
  guestDailyLimit?: number;
  guestDailyRemaining?: number;
  guestDailyCapReached?: boolean;
}

type PetalCounterInnerProps = PetalCounterProps & {
  isSignedIn: boolean;
};

function PetalCounterComponent(props: PetalCounterProps) {
  if (isVisualQaAuthEnabled()) {
    return (
      <PetalCounterInner
        {...props}
        isSignedIn={resolveVisualQaAuthState() === 'signed-in'}
      />
    );
  }

  return <ClerkPetalCounter {...props} />;
}

function ClerkPetalCounter(props: PetalCounterProps) {
  const { isSignedIn } = useAuth();
  return <PetalCounterInner {...props} isSignedIn={Boolean(isSignedIn)} />;
}

function PetalCounterInner({
  count,
  lastValue = 1,
  guestDailyLimit = 50,
  guestDailyRemaining = 50,
  guestDailyCapReached = false,
  isSignedIn,
}: PetalCounterInnerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [showMultiplier, setShowMultiplier] = useState(false);
  const [prevCount, setPrevCount] = useState(count);
  const [displayCount, setDisplayCount] = useState(count);
  const animationFrameRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

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
  const shouldShowGuestPrompt =
    !isSignedIn &&
    (guestDailyCapReached ||
      count >= COLLECTION.GUEST_DAILY_PROMPT_THRESHOLD ||
      guestDailyRemaining <= guestDailyLimit - COLLECTION.GUEST_DAILY_PROMPT_THRESHOLD);

  return (
    <motion.button
      type="button"
      data-petal-counter
      aria-label={`Petals collected: ${displayCount}`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={
        prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 25 }
      }
      className="fixed z-50 cursor-default outline-none focus:ring-2 focus:ring-pink-400/50 focus:ring-offset-2 focus:ring-offset-black/50 rounded-full"
      style={{
        bottom: `${UI.COUNTER_BOTTOM_RIGHT_MARGIN}px`,
        right: `${UI.COUNTER_BOTTOM_RIGHT_MARGIN}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => e.preventDefault()}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
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
        <motion.span
          aria-hidden="true"
          className="h-5 w-5 flex-shrink-0 bg-[length:400%_300%] bg-no-repeat"
          style={{
            backgroundImage: `url(${HOME_SCENE_MANIFEST.petals.src})`,
            backgroundPosition: resolvePetalSpritePosition(2),
          }}
          animate={{
            rotate: isPulsing && !prefersReducedMotion ? [0, 12, -12, 0] : 0,
            scale: isPulsing && !prefersReducedMotion ? [1, 1.16, 1] : 1,
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        />

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

        <AnimatePresence>
          {shouldShowGuestPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-[#f6dcc7]/16 bg-[#12090d]/88 px-3 py-2 text-left text-[11px] leading-4 text-[#ffe8df]/78 shadow-[0_12px_28px_rgba(0,0,0,0.34)]"
            >
              {guestDailyCapReached
                ? 'Guest petals are full for today. Sign in to keep future blooms.'
                : "Almost at today's guest bloom limit. Sign in to keep collecting."}
            </motion.div>
          )}
        </AnimatePresence>
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
            <div className="flex items-center gap-1 rounded-full border border-[#f4c4d3]/42 bg-[#341822]/92 px-3 py-1.5 shadow-lg backdrop-blur-sm">
              <span className="text-sm font-bold text-[#ffe8e0]">+{lastValue}</span>
              <motion.span
                animate={prefersReducedMotion ? undefined : { rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
                className="h-3 w-3 rounded-full bg-[#f8cfda] shadow-[0_0_10px_rgba(248,207,218,0.64)]"
                aria-hidden="true"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default memo(PetalCounterComponent);
