'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = AchievementsError;
const react_1 = __importDefault(require('react'));
const framer_motion_1 = require('framer-motion');
function AchievementsError({ error, reset }) {
  return (
    <framer_motion_1.motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[60vh] items-center justify-center"
    >
      <div className="text-center">
        <div className="mb-4 text-6xl">😢</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Something went wrong!
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {error.message || 'Failed to load achievements'}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </framer_motion_1.motion.div>
  );
}
