/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useSound } from '@/lib/hooks/useSound';
import { useHaptic } from '@/lib/hooks/useHaptic';
import { useAchievements } from '@/lib/hooks/useAchievements';
import { useUserStore } from '@/lib/store/userStore';

interface ReactiveAvatarProps {
  className?: string;
}

export const ReactiveAvatar = ({ className = '' }: ReactiveAvatarProps) => {
  const [mood, setMood] = useState<'neutral' | 'happy' | 'excited' | 'thinking'>('neutral');
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useUserStore();
  const { achievements } = useAchievements();
  const { vibrate } = useHaptic();

  // Calculate avatar state based on user progress
  const calculateMood = () => {
    const unlockedAchievements = achievements.filter((a) => a.unlockedAt).length;
    const totalAchievements = achievements.length;
    const achievementRatio = unlockedAchievements / totalAchievements;

    if (achievementRatio > 0.8) return 'excited';
    if (achievementRatio > 0.5) return 'happy';
    if (achievementRatio > 0.2) return 'thinking';
    return 'neutral';
  };

  // Update mood based on achievements and interactions
  useEffect(() => {
    const newMood = calculateMood();
    if (newMood !== mood) {
      setMood(newMood);
      vibrate('light');
    }
  }, [achievements, mood, vibrate]);

  // Avatar expressions based on mood
  const expressions = {
    neutral: '⚜️',
    happy: '✧',
    excited: '❈',
    thinking: '❋',
  };

  // Animation variants
  const variants: Variants = {
    idle: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: {
        duration: 0.5,
      },
    },
    excited: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 10, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  };

  return (
    <motion.div
      data-tutorial="avatar"
      className={`group relative ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={mood === 'excited' ? 'excited' : isHovered ? 'hover' : 'idle'}
      variants={variants}
    >
      {/* Avatar Container */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm">
        <motion.span
          className="text-4xl"
          animate={{
            scale: mood === 'excited' ? [1, 1.2, 1] : 1,
            rotate: mood === 'thinking' ? [0, 5, -5, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse' as const,
          }}
        >
          {expressions[mood]}
        </motion.span>
      </div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/80 px-3 py-1 text-sm text-white/90"
          >
            {user?.username || 'Wandering Soul'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Indicator */}
      <div className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500/50">
        <motion.div
          className="h-2 w-2 rounded-full"
          animate={{
            backgroundColor:
              mood === 'excited' ? '#ec4899' : mood === 'happy' ? '#f472b6' : '#f9a8d4',
          }}
        />
      </div>
    </motion.div>
  );
};
