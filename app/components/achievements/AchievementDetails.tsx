import React from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '../../types/achievements';
import { useAchievements } from '../../contexts/AchievementContext';

interface AchievementDetailsProps {
  achievement: Achievement;
}

export function AchievementDetails({ achievement }: AchievementDetailsProps) {
  const { unlock } = useAchievements();
  const isUnlocked = !!achievement.unlockedAt || achievement.isUnlocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img src={achievement.icon} alt={achievement.name} className="h-16 w-16 rounded-lg" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{achievement.name}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{achievement.category}</p>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{achievement.description}</p>
        </div>
      </div>

      {!isUnlocked && achievement.progress !== undefined && achievement.target !== undefined && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {achievement.progress} / {achievement.target}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
              className="h-2 rounded-full bg-indigo-600"
            />
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Rewards</h3>
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {achievement.petals} Petals
          </span>
          {achievement.badge && (
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              {achievement.badge}
            </span>
          )}
        </div>
      </div>

      {achievement.unlockedAt && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Unlocked</h3>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </motion.div>
  );
}
