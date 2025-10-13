'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface PetalCollectionToastProps {
  show: boolean;
  amount: number;
  totalCollected: number;
  petalType?: 'normal' | 'golden' | 'glitch' | 'blackLotus';
  position?: { x: number; y: number };
  onComplete?: () => void;
}

const PETAL_NAMES = {
  normal: 'Cherry Petal',
  golden: 'Golden Bloom',
  glitch: 'Glitch Fragment',
  blackLotus: 'Black Lotus',
};

const PETAL_COLORS = {
  normal: 'from-pink-400 to-pink-600',
  golden: 'from-yellow-400 to-yellow-600',
  glitch: 'from-purple-400 to-purple-600',
  blackLotus: 'from-black to-purple-900',
};

export default function PetalCollectionToast({
  show,
  amount,
  totalCollected,
  petalType = 'normal',
  position,
  onComplete,
}: PetalCollectionToastProps) {
  const [displayStage, setDisplayStage] = useState<'first' | 'milestone' | 'normal'>('normal');

  useEffect(() => {
    if (totalCollected === 1) {
      setDisplayStage('first');
    } else if (totalCollected === 3 || totalCollected === 10 || totalCollected % 50 === 0) {
      setDisplayStage('milestone');
    } else {
      setDisplayStage('normal');
    }
  }, [totalCollected]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(
        () => {
          onComplete?.();
        },
        displayStage === 'first' ? 4000 : displayStage === 'milestone' ? 3000 : 2000,
      );

      return () => clearTimeout(timer);
    }
  }, [show, displayStage, onComplete]);

  const getMessage = () => {
    if (displayStage === 'first') {
      return {
        title: 'You collected a Cherry Petal!',
        subtitle: 'Click floating petals to collect more',
        description: 'Petals are the currency of Otaku-mori',
      };
    }

    if (displayStage === 'milestone') {
      if (totalCollected === 3) {
        return {
          title: `Your Petal Wallet: ${totalCollected} petals`,
          subtitle: 'Keep collecting to unlock rewards!',
          description: 'Petals can be spent on games, cosmetics, and more',
        };
      }
      if (totalCollected === 10) {
        return {
          title: `${totalCollected} Petals collected!`,
          subtitle: "You're a natural collector",
          description: 'Rare petals appear during special conditions',
        };
      }
      if (totalCollected % 50 === 0) {
        return {
          title: `${totalCollected} Petals!`,
          subtitle: 'Impressive collection!',
          description: 'New rewards unlocked in the shop',
        };
      }
    }

    return {
      title: `+${amount} ${PETAL_NAMES[petalType]}`,
      subtitle: `Total: ${totalCollected}`,
      description: null,
    };
  };

  const message = getMessage();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.68, -0.55, 0.265, 1.55] }}
          className="fixed z-[200] pointer-events-none"
          style={{
            left: position ? `${position.x}px` : '50%',
            top: position ? `${position.y - 100}px` : '20%',
            transform: !position ? 'translateX(-50%)' : undefined,
          }}
        >
          <div
            className={`relative bg-gradient-to-br ${PETAL_COLORS[petalType]} backdrop-blur-xl border-2 border-white/40 rounded-2xl shadow-2xl overflow-hidden ${displayStage === 'first' ? 'p-6 min-w-[320px]' : displayStage === 'milestone' ? 'p-5 min-w-[280px]' : 'p-4 min-w-[200px]'}`}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />

            {/* Content */}
            <div className="relative z-10 flex items-center gap-4">
              {/* Petal icon */}
              <motion.div
                initial={{ rotate: 0, scale: 1 }}
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="flex-shrink-0"
              >
                <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Image
                    src={`/assets/petal-${petalType}.svg`}
                    alt={PETAL_NAMES[petalType]}
                    width={32}
                    height={32}
                    className="drop-shadow-lg"
                  />
                </div>
              </motion.div>

              {/* Text content */}
              <div className="flex-1 text-white">
                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`font-bold ${displayStage === 'first' ? 'text-xl' : 'text-lg'}`}
                >
                  {message.title}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/90 text-sm font-medium"
                >
                  {message.subtitle}
                </motion.p>

                {message.description && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/70 text-xs mt-1"
                  >
                    {message.description}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Sparkle effects for milestones */}
            {displayStage !== 'normal' && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    initial={{
                      x: '50%',
                      y: '50%',
                      opacity: 0,
                      scale: 0,
                    }}
                    animate={{
                      x: `${50 + Math.cos((i * Math.PI * 2) / 6) * 100}%`,
                      y: `${50 + Math.sin((i * Math.PI * 2) / 6) * 100}%`,
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
