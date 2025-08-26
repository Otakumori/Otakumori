/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { motion } from 'framer-motion';
import type { Achievement } from './AchievementProvider';
import { useAchievements } from './AchievementProvider';

interface AchievementProgressProps {
  achievement: Achievement;
}

export function AchievementProgress({ achievement }: AchievementProgressProps) {
  const { unlockAchievement } = useAchievements();
  const isUnlocked = achievement.unlocked;

  // Use achievement's own progress data if available
  const current = achievement.progress || 0;
  const target = achievement.total || 1;

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {achievement.title}
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
