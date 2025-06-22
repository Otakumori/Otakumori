'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AchievementCard = AchievementCard;
const react_1 = __importDefault(require('react'));
const framer_motion_1 = require('framer-motion');
const AchievementContext_1 = require('@/app/contexts/AchievementContext');
function AchievementCard({ achievement }) {
  const { getProgress } = (0, AchievementContext_1.useAchievements)();
  const progress = getProgress(achievement.id);
  const isUnlocked = !!achievement.unlockedAt;
  return (
    <framer_motion_1.motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg bg-white p-6 shadow-lg transition-opacity dark:bg-gray-800 ${!isUnlocked ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img
            src={achievement.icon}
            alt={achievement.name}
            className={`h-12 w-12 rounded-lg ${!isUnlocked ? 'grayscale' : ''}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-medium text-gray-900 dark:text-white">
            {achievement.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{achievement.category}</p>
          <p className="mt-2 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
            {achievement.description}
          </p>
        </div>
      </div>

      {!isUnlocked && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {progress.current} / {progress.target}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <framer_motion_1.motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(progress.current / progress.target) * 100}%` }}
              className="h-1.5 rounded-full bg-indigo-600"
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {achievement.petals} Petals
          </span>
          {achievement.badge && (
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              {achievement.badge}
            </span>
          )}
        </div>
        {isUnlocked && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </framer_motion_1.motion.div>
  );
}
