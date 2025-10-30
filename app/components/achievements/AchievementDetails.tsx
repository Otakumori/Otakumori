import { motion } from 'framer-motion';

import type { Achievement } from './AchievementProvider';
import { useAchievements } from './AchievementProvider';

interface AchievementDetailsProps {
  achievement: Achievement;
}

const isImageSource = (value: string) => value.startsWith('/') || value.startsWith('http');

export function AchievementDetails({ achievement }: AchievementDetailsProps) {
  const { unlockAchievement } = useAchievements();
  const { unlocked, progress, total } = achievement;
  const ratio = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
    >
      <div className="flex items-start space-x-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-pink-100 text-3xl">
          {isImageSource(achievement.icon) ? (
            <img
              src={achievement.icon}
              alt="Achievement icon"
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <span>{achievement.icon}</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{achievement.title}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Achievement</p>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{achievement.description}</p>
        </div>
      </div>

      {!unlocked && total > 0 && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Progress</span>
            <span>
              {progress} / {total} ({ratio}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ratio}%` }}
              className="h-2 rounded-full bg-indigo-600"
            />
          </div>
        </div>
      )}

      {achievement.reward && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Reward</h3>
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
            {achievement.reward.type === 'points' && <span>{achievement.reward.value} Points</span>}
            {achievement.reward.type === 'discount' && (
              <span>{achievement.reward.value}% Discount</span>
            )}
            {achievement.reward.type === 'badge' && (
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                {achievement.reward.value}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Status</h3>
        {unlocked ? (
          <p className="mt-2 text-sm text-green-500">Unlocked</p>
        ) : (
          <button
            type="button"
            className="mt-2 text-sm text-pink-500 hover:text-pink-400"
            onClick={() => unlockAchievement(achievement.id)}
          >
            Mark as unlocked
          </button>
        )}
      </div>
    </motion.div>
  );
}
