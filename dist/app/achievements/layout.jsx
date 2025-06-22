'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = AchievementsLayout;
const react_1 = __importDefault(require('react'));
const AchievementContext_1 = require('@/app/contexts/AchievementContext');
const AchievementNotificationManager_1 = require('@/app/components/achievements/AchievementNotificationManager');
function AchievementsLayout({ children }) {
  return (
    <AchievementContext_1.AchievementProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">{children}</main>
        <AchievementNotificationManager_1.AchievementNotificationManager />
      </div>
    </AchievementContext_1.AchievementProvider>
  );
}
