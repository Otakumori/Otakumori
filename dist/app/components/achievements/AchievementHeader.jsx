'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AchievementHeader = AchievementHeader;
const react_1 = __importDefault(require('react'));
const framer_motion_1 = require('framer-motion');
const AchievementContext_1 = require('@/app/contexts/AchievementContext');
function AchievementHeader() {
  const { achievements } = (0, AchievementContext_1.useAchievements)();
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalPetals = achievements.reduce((sum, a) => sum + (a.unlockedAt ? a.petals : 0), 0);
  return (
    <framer_motion_1.motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Achievements</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Complete achievements to earn petals and badges
          </p>
        </div>
        <div className="mt-4 flex items-center space-x-6 md:mt-0">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {unlockedCount}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Unlocked</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalPetals}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Petals</p>
          </div>
        </div>
      </div>
    </framer_motion_1.motion.div>
  );
}
