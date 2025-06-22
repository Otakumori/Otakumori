'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = AchievementsNotFound;
const react_1 = __importDefault(require('react'));
const framer_motion_1 = require('framer-motion');
const link_1 = __importDefault(require('next/link'));
function AchievementsNotFound() {
  return (
    <framer_motion_1.motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[60vh] items-center justify-center"
    >
      <div className="text-center">
        <div className="mb-4 text-6xl">🔍</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Page Not Found</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          The achievement page you're looking for doesn't exist or has been moved.
        </p>
        <link_1.default
          href="/achievements"
          className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Back to Achievements
        </link_1.default>
      </div>
    </framer_motion_1.motion.div>
  );
}
