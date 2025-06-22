'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.AchievementNotificationManager = AchievementNotificationManager;
const react_1 = __importStar(require('react'));
const framer_motion_1 = require('framer-motion');
const AchievementContext_1 = require('@/app/contexts/AchievementContext');
const AchievementNotification_1 = require('./AchievementNotification');
const achievementSound_1 = require('@/app/utils/achievementSound');
function AchievementNotificationManager() {
  const [notifications, setNotifications] = (0, react_1.useState)([]);
  const { achievements } = (0, AchievementContext_1.useAchievements)();
  (0, react_1.useEffect)(() => {
    const handleAchievementUnlock = achievement => {
      setNotifications(prev => [...prev, achievement]);
      achievementSound_1.achievementSound.play();
    };
    // Listen for achievement unlock events
    window.addEventListener('achievementUnlock', event => {
      handleAchievementUnlock(event.detail);
    });
    return () => {
      window.removeEventListener('achievementUnlock', event => {
        handleAchievementUnlock(event.detail);
      });
    };
  }, []);
  const handleClose = achievementId => {
    setNotifications(prev => prev.filter(achievement => achievement.id !== achievementId));
  };
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-4">
      <framer_motion_1.AnimatePresence>
        {notifications.map(achievement => (
          <AchievementNotification_1.AchievementNotification
            key={achievement.id}
            achievement={achievement}
            onClose={() => handleClose(achievement.id)}
          />
        ))}
      </framer_motion_1.AnimatePresence>
    </div>
  );
}
