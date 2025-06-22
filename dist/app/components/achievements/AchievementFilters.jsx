'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AchievementFilters = AchievementFilters;
const react_1 = __importDefault(require('react'));
const framer_motion_1 = require('framer-motion');
function AchievementFilters({
  selectedCategory,
  onCategoryChange,
  showHidden,
  onShowHiddenChange,
  showUnlocked,
  onShowUnlockedChange,
}) {
  const categories = [
    'All',
    'Site Interaction',
    'Profile Growth',
    'Shopping Engagement',
    'Community and Commenting',
    'Lore Discovery',
    'Mystery and Chaos',
    'Seasonal and Event',
    'Special and Hidden',
  ];
  return (
    <framer_motion_1.motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-4"
    >
      <div className="flex-1">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={showHidden}
            onChange={e => onShowHiddenChange(e.target.checked)}
            className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show Hidden</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={showUnlocked}
            onChange={e => onShowUnlockedChange(e.target.checked)}
            className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show Unlocked</span>
        </label>
      </div>
    </framer_motion_1.motion.div>
  );
}
