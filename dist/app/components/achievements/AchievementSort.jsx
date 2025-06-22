'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AchievementSort = AchievementSort;
const react_1 = __importDefault(require('react'));
const framer_motion_1 = require('framer-motion');
function AchievementSort({ value, onChange }) {
  const options = [
    { value: 'name', label: 'Name' },
    { value: 'category', label: 'Category' },
    { value: 'progress', label: 'Progress' },
    { value: 'recent', label: 'Recently Unlocked' },
  ];
  return (
    <framer_motion_1.motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-2"
    >
      <span className="text-sm text-gray-700 dark:text-gray-300">Sort by:</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="block w-40 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </framer_motion_1.motion.div>
  );
}
