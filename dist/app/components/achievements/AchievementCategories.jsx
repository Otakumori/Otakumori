'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AchievementCategories = AchievementCategories;
const react_1 = __importDefault(require('react'));
const framer_motion_1 = require('framer-motion');
const AchievementContext_1 = require('@/app/contexts/AchievementContext');
function AchievementCategories({ selectedCategory, onSelectCategory }) {
  const { achievements } = (0, AchievementContext_1.useAchievements)();
  const categories = Array.from(new Set(achievements.map(a => a.category))).sort();
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <framer_motion_1.motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`rounded-full px-4 py-2 text-sm font-medium ${
          selectedCategory === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        }`}
        onClick={() => onSelectCategory(null)}
      >
        All
      </framer_motion_1.motion.button>
      {categories.map(category => (
        <framer_motion_1.motion.button
          key={category}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            selectedCategory === category
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </framer_motion_1.motion.button>
      ))}
    </div>
  );
}
