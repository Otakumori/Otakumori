'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AchievementProgress = AchievementProgress;
const react_1 = __importDefault(require('react'));
const framer_motion_1 = require('framer-motion');
const AchievementContext_1 = require('@/app/contexts/AchievementContext');
function AchievementProgress({ achievement }) {
  const { getAchievementProgress } = (0, AchievementContext_1.useAchievements)();
  const progress = getAchievementProgress(achievement.id);
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {achievement.name}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {progress.current}/{progress.target}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <framer_motion_1.motion.div
          className="h-2.5 rounded-full bg-blue-600 dark:bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${(progress.current / progress.target) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
