'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AchievementList = AchievementList;
const react_1 = __importDefault(require('react'));
const framer_motion_1 = require('framer-motion');
const AchievementContext_1 = require('@/app/contexts/AchievementContext');
const AchievementCard_1 = require('./AchievementCard');
function AchievementList({ category }) {
  const { achievements } = (0, AchievementContext_1.useAchievements)();
  const filteredAchievements = category
    ? achievements.filter(a => a.category === category)
    : achievements;
  return (
    <framer_motion_1.motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {filteredAchievements.map(achievement => (
        <framer_motion_1.motion.div
          key={achievement.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AchievementCard_1.AchievementCard achievement={achievement} />
        </framer_motion_1.motion.div>
      ))}
    </framer_motion_1.motion.div>
  );
}
