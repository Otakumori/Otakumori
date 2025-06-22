'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AchievementStats = AchievementStats;
const react_1 = __importDefault(require('react'));
const AchievementContext_1 = require('@/app/contexts/AchievementContext');
function AchievementStats() {
  const { achievements } = (0, AchievementContext_1.useAchievements)();
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalPetals = achievements.reduce((sum, a) => sum + (a.unlockedAt ? a.petals : 0), 0);
  const completionPercentage = Math.round((unlockedCount / achievements.length) * 100);
  const stats = [
    {
      name: 'Total Achievements',
      value: achievements.length,
      icon: '🏆',
    },
    {
      name: 'Unlocked',
      value: unlockedCount,
      icon: '🔓',
    },
    {
      name: 'Completion',
      value: `${completionPercentage}%`,
      icon: '📊',
    },
    {
      name: 'Total Petals',
      value: totalPetals,
      icon: '🌸',
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map(stat => (
        <div key={stat.name} className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
            <div className="text-2xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
