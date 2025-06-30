import React from 'react';
import { motion } from 'framer-motion';
import type { Achievement } from '../../types/achievements';
import { useAchievements } from '../../contexts/AchievementContext';

interface AchievementProgressProps {
  achievement: Achievement;
}

export function AchievementProgress({ achievement }: AchievementProgressProps) {
  const { unlock } = useAchievements();
  const isUnlocked = !!achievement.unlockedAt || achievement.isUnlocked;

  // Use achievement's own progress data if available
  const current = achievement.progress || 0;
  const target = achievement.target || 1;

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {achievement.name}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {current}/{target}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <motion.div
          className="h-2.5 rounded-full bg-blue-600 dark:bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${(current / target) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
