'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePetalContext } from '@/providers';

interface PetalWalletIndicatorProps {
  showAfterCollections?: number;
  position?: 'navbar' | 'floating';
  onClick?: () => void;
}

export default function PetalWalletIndicator({
  showAfterCollections = 3,
  position = 'navbar',
  onClick,
}: PetalWalletIndicatorProps) {
  const petalStore = usePetalContext();
  const { petals } = petalStore();
  const [hasCollected, setHasCollected] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousPetals, setPreviousPetals] = useState(0);

  // Check localStorage for first-time experience
  useEffect(() => {
    const collected = localStorage.getItem('otm-petals-collected');
    if (collected) {
      setHasCollected(true);
      setShouldShow(petals >= showAfterCollections);
    }
  }, [petals, showAfterCollections]);

  // Handle petal collection
  useEffect(() => {
    if (petals > 0 && !hasCollected) {
      localStorage.setItem('otm-petals-collected', 'true');
      setHasCollected(true);
    }

    if (petals >= showAfterCollections) {
      setShouldShow(true);
    }

    // Animate on petal increase
    if (petals > previousPetals) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }

    setPreviousPetals(petals);
  }, [petals, hasCollected, showAfterCollections, previousPetals]);

  if (!shouldShow) return null;

  const formatPetals = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: position === 'navbar' ? -20 : 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.68, -0.55, 0.265, 1.55] }}
          onClick={onClick}
          className={`relative flex items-center gap-2 ${position === 'navbar' ? 'px-3 py-1.5' : 'px-4 py-2'} bg-gradient-to-br from-pink-500/90 to-purple-500/90 backdrop-blur-lg border-2 border-white/40 rounded-full shadow-lg hover:shadow-xl hover:border-white/60 transition-all duration-300 group`}
          aria-label={`Petal Wallet: ${petals} petals`}
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />

          {/* Petal icon */}
          <motion.div
            animate={
              isAnimating
                ? {
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.2, 1.2, 1.2, 1],
                  }
                : {}
            }
            transition={{ duration: 0.6 }}
            className="relative z-10 flex-shrink-0"
          >
            <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
              <Image
                src="/assets/petal-logo-style.svg"
                alt="Petal"
                width={16}
                height={16}
                className="drop-shadow-md"
              />
            </div>
          </motion.div>

          {/* Petal count */}
          <motion.span
            key={petals}
            initial={isAnimating ? { scale: 1.3, color: '#ffffff' } : false}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.3 }}
            className={`relative z-10 font-bold text-white ${position === 'navbar' ? 'text-sm' : 'text-base'} drop-shadow-md`}
          >
            {formatPetals(petals)}
          </motion.span>

          {/* Pulse effect on collection */}
          {isAnimating && (
            <motion.div
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full border-4 border-white"
            />
          )}

          {/* Sparkle particles */}
          {isAnimating && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  animate={{
                    x: Math.cos((i * Math.PI) / 2) * 30,
                    y: Math.sin((i * Math.PI) / 2) * 30,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              ))}
            </>
          )}

          {/* Tooltip hint on hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            {petals === showAfterCollections && 'Spend petals in games & shop!'}
            {petals > showAfterCollections && petals < 100 && 'Click to view wallet details'}
            {petals >= 100 && "You're a master collector!"}
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
