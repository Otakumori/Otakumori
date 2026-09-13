'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import { ANIMATION, COLLECTION, UI } from '@/app/lib/petals/constants';
import { isVisualQaAuthEnabled, resolveVisualQaAuthState } from '@/app/lib/visual-qa/mode';

const PETAL_WALLET_EMBLEM_SOURCE = '/assets/home/ui/petal-wallet-satchel.png';

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
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (count === prevCount) return undefined;

    if (count > prevCount) {
      setIsPulsing(true);

      if (lastValue === 5) {
        setShowMultiplier(true);
      }

      const pulseTimer = window.setTimeout(() => setIsPulsing(false), ANIMATION.COUNTER_PULSE);
      const multiplierTimer =
        lastValue === 5 ? window.setTimeout(() => setShowMultiplier(false), 1500) : undefined;

      setPrevCount(count);
      return () => {
        window.clearTimeout(pulseTimer);
        if (multiplierTimer) window.clearTimeout(multiplierTimer);
      };
    }

    setPrevCount(count);
    return undefined;
  }, [count, prevCount, lastValue]);

  const formattedCount = useMemo(() => {
    return count.toLocaleString();
  }, [count]);
  const shouldShowGuestPrompt =
    !isSignedIn &&
    (guestDailyCapReached ||
      count >= COLLECTION.GUEST_DAILY_PROMPT_THRESHOLD ||
      guestDailyRemaining <= guestDailyLimit - COLLECTION.GUEST_DAILY_PROMPT_THRESHOLD);

  return (
    <motion.button
      type="button"
      data-petal-counter
      aria-label={`Petals collected: ${count}`}
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
      <motion.div
        className={`
          relative flex min-w-[12rem] items-center gap-3 rounded-[1.1rem] border border-[#f6dcc7]/30 bg-[#160d12]/76 p-2 pr-4
          shadow-[0_10px_28px_rgba(0,0,0,0.32)] backdrop-blur-[5px]
          transition-all duration-300
          ${isHovered ? 'border-[#ffe2d0]/54' : ''}
          ${isPulsing ? 'ring-1 ring-[#f6c9bc]/55 ring-offset-1 ring-offset-[#160d12]/60' : ''}
        `}
        animate={{
          scale: isPulsing && !prefersReducedMotion ? [1, 1.035, 1] : 1,
          boxShadow: isPulsing
            ? [
                '0 10px 28px rgba(0,0,0,0.32)',
                '0 12px 30px rgba(76,39,42,0.38)',
                '0 10px 28px rgba(0,0,0,0.32)',
              ]
            : '0 10px 28px rgba(0,0,0,0.32)',
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.34 }}
      >
        <motion.span
          aria-hidden="true"
          className="grid h-14 w-14 flex-shrink-0 place-items-center overflow-hidden rounded-[0.85rem] border border-[#f7dec8]/20 bg-[#10090d]/44"
          data-petal-wallet-source="approved-home-ui-v1"
          animate={{
            rotate: isPulsing && !prefersReducedMotion ? [0, 5, -4, 0] : 0,
            scale: isPulsing && !prefersReducedMotion ? [1, 1.07, 1] : 1,
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <Image
            src={PETAL_WALLET_EMBLEM_SOURCE}
            alt=""
            width={56}
            height={56}
            sizes="56px"
            className="h-full w-full object-contain p-0.5"
          />
        </motion.span>

        <span className="min-w-0 text-left">
          <span className="font-ui block text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#f7d8cb]/72">
            Petal Wallet
          </span>
          <motion.span
            key={count}
            className="mt-0.5 block min-w-[30px] text-lg font-semibold tabular-nums text-[#fff4e8]"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.56)' }}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {formattedCount}
          </motion.span>
        </span>

        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
          initial={{ x: '-100%' }}
          animate={isPulsing && !prefersReducedMotion ? { x: ['-100%', '120%'] } : { x: '-100%' }}
          transition={{ duration: 0.38 }}
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
                animate={prefersReducedMotion ? undefined : { rotate: [0, 7, -6, 0] }}
                transition={{ duration: 0.42 }}
                className="h-3 w-3 rounded-full border border-[#ffe8df]/52 bg-[#f8cfda]"
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
