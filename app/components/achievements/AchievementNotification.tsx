/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import type { Achievement } from './AchievementProvider';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="fixed bottom-4 right-4 w-80 overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800"
    >
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 flex-shrink-0">
            <img
              src={achievement.icon}
              alt={achievement.title}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Achievement Unlocked!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{achievement.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">{achievement.description}</p>
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-2">Reward:</span>
            <span className="flex items-center">
              <img src="/assets/achievements/petal.png" alt="Petal" className="mr-1 h-4 w-4" />
              {achievement.reward?.type === 'points' ? achievement.reward.value : 'Unknown'} {achievement.reward?.type === 'points' ? 'points' : (achievement.reward?.type || 'reward')}
            </span>
          </div>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
    </motion.div>
  );
}
