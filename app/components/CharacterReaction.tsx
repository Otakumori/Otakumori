'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface CharacterReactionProps {
  characterConfig?: any;
  className?: string;
}

export default function CharacterReaction({
  characterConfig,
  className = '',
}: CharacterReactionProps) {
  const [currentReaction, setCurrentReaction] = useState<string>('idle');
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Context-based reactions
  const getContextReaction = (path: string) => {
    if (path.includes('/shop')) return 'excited';
    if (path.includes('/games') || path.includes('/mini-games')) return 'focused';
    if (path.includes('/social') || path.includes('/friends')) return 'happy';
    if (path.includes('/achievements')) return 'excited';
    if (path.includes('/profile')) return 'happy';
    return 'idle';
  };

  // Reaction animations and messages
  const reactions = {
    idle: {
      message: 'Ready for adventure?!',
      emoji: '°⋆.ೃ࿔*:･',
      color: 'from-pink-400 to-purple-400',
    },
    happy: {
      message: 'Nu-uh! Is that...you? No way.',
      emoji: ':(ˆ⌣ˆԅ)',
      color: 'from-yellow-400 to-orange-400',
    },
    excited: {
      message: 'This is amaze-balls!',
      emoji: 'ദ്ദി ˉ͈̀꒳ˉ͈́ )',
      color: 'from-red-400 to-pink-400',
    },
    focused: {
      message: "Let's goooooooo!",
      emoji: '◝(ᵔᵕᵔ)◜',
      color: 'from-blue-400 to-purple-400',
    },
    sleepy: {
      message: "counting...digital...sheep...if that's a thing...",
      emoji: 'ᶻ 𝗓 𐰁',
      color: 'from-gray-400 to-blue-400',
    },
  };

  useEffect(() => {
    const newReaction = getContextReaction(pathname);
    setCurrentReaction(newReaction);

    // Show reaction for a few seconds
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Random idle reactions
  useEffect(() => {
    if (currentReaction === 'idle') {
      const interval = setInterval(() => {
        const randomReactions = ['happy', 'excited', 'focused'];
        const randomReaction = randomReactions[Math.floor(Math.random() * randomReactions.length)];

        if (randomReaction) {
          setCurrentReaction(randomReaction);
          setIsVisible(true);
        }

        setTimeout(() => {
          setIsVisible(false);
          setCurrentReaction('idle');
        }, 2000);
      }, 15000); // Every 15 seconds

      return () => clearInterval(interval);
    }
  }, [currentReaction]);

  if (!characterConfig) return null;

  const reaction = reactions[currentReaction as keyof typeof reactions];

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative"
          >
            {/* Character Avatar */}
            <motion.div
              animate={{
                rotate: currentReaction === 'excited' ? [0, -10, 10, 0] : 0,
                scale: currentReaction === 'happy' ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white/20"
            >
              {reaction.emoji}
            </motion.div>

            {/* Speech Bubble */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20"
            >
              <div className="text-sm font-medium text-gray-800">{reaction.message}</div>

              {/* Speech bubble tail */}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/90"></div>
            </motion.div>

            {/* Reaction particles */}
            {currentReaction === 'excited' && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos((i * 60 * Math.PI) / 180) * 30,
                      y: Math.sin((i * 60 * Math.PI) / 180) * 30,
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
