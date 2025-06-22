'use strict';
'use client';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ReactiveAvatar = void 0;
const react_1 = require('react');
const framer_motion_1 = require('framer-motion');
const useSound_1 = require('@/lib/hooks/useSound');
const useHaptic_1 = require('@/lib/hooks/useHaptic');
const useAchievements_1 = require('@/lib/hooks/useAchievements');
const userStore_1 = require('@/lib/store/userStore');
const ReactiveAvatar = ({ className = '' }) => {
  const [mood, setMood] = (0, react_1.useState)('neutral');
  const [isHovered, setIsHovered] = (0, react_1.useState)(false);
  const { user } = (0, userStore_1.useUserStore)();
  const { achievements } = (0, useAchievements_1.useAchievements)();
  const { playSound } = (0, useSound_1.useSound)();
  const { vibrate } = (0, useHaptic_1.useHaptic)();
  // Calculate avatar state based on user progress
  const calculateMood = () => {
    const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;
    const totalAchievements = achievements.length;
    const achievementRatio = unlockedAchievements / totalAchievements;
    if (achievementRatio > 0.8) return 'excited';
    if (achievementRatio > 0.5) return 'happy';
    if (achievementRatio > 0.2) return 'thinking';
    return 'neutral';
  };
  // Update mood based on achievements and interactions
  (0, react_1.useEffect)(() => {
    const newMood = calculateMood();
    if (newMood !== mood) {
      setMood(newMood);
      playSound('achievement');
      vibrate('light');
    }
  }, [achievements, mood, playSound, vibrate]);
  // Avatar expressions based on mood
  const expressions = {
    neutral: '⚜️',
    happy: '✧',
    excited: '❈',
    thinking: '❋',
  };
  // Animation variants
  const variants = {
    idle: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
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
        repeatType: 'reverse',
      },
    },
  };
  return (
    <framer_motion_1.motion.div
      data-tutorial="avatar"
      className={`group relative ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={mood === 'excited' ? 'excited' : isHovered ? 'hover' : 'idle'}
      variants={variants}
    >
      {/* Avatar Container */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm">
        <framer_motion_1.motion.span
          className="text-4xl"
          animate={{
            scale: mood === 'excited' ? [1, 1.2, 1] : 1,
            rotate: mood === 'thinking' ? [0, 5, -5, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          {expressions[mood]}
        </framer_motion_1.motion.span>
      </div>

      {/* Hover Tooltip */}
      <framer_motion_1.AnimatePresence>
        {isHovered && (
          <framer_motion_1.motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/80 px-3 py-1 text-sm text-white/90"
          >
            {user?.username || 'Wandering Soul'}
          </framer_motion_1.motion.div>
        )}
      </framer_motion_1.AnimatePresence>

      {/* Mood Indicator */}
      <div className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500/50">
        <framer_motion_1.motion.div
          className="h-2 w-2 rounded-full"
          animate={{
            backgroundColor:
              mood === 'excited' ? '#ec4899' : mood === 'happy' ? '#f472b6' : '#f9a8d4',
          }}
        />
      </div>
    </framer_motion_1.motion.div>
  );
};
exports.ReactiveAvatar = ReactiveAvatar;
