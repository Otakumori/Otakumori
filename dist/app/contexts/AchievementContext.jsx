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
exports.AchievementProvider = AchievementProvider;
exports.useAchievements = useAchievements;
const react_1 = __importStar(require('react'));
const AchievementContext = (0, react_1.createContext)(undefined);
function AchievementProvider({ children }) {
  const [achievements, setAchievements] = (0, react_1.useState)([]);
  (0, react_1.useEffect)(() => {
    // Load achievements from localStorage or API
    const loadAchievements = async () => {
      try {
        const storedAchievements = localStorage.getItem('achievements');
        if (storedAchievements) {
          setAchievements(JSON.parse(storedAchievements));
        } else {
          // Initialize with default achievements
          const defaultAchievements = [
            // Add your default achievements here
          ];
          setAchievements(defaultAchievements);
          localStorage.setItem('achievements', JSON.stringify(defaultAchievements));
        }
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    };
    loadAchievements();
  }, []);
  const getProgress = achievementId => {
    const achievement = achievements.find(a => a.id === achievementId);
    return achievement?.progress || { current: 0, target: 0 };
  };
  const unlockAchievement = achievementId => {
    setAchievements(prev =>
      prev.map(achievement => {
        if (achievement.id === achievementId && !achievement.unlockedAt) {
          const updatedAchievement = {
            ...achievement,
            unlockedAt: new Date().toISOString(),
          };
          // Dispatch achievement unlock event
          window.dispatchEvent(
            new CustomEvent('achievementUnlock', {
              detail: updatedAchievement,
            })
          );
          return updatedAchievement;
        }
        return achievement;
      })
    );
  };
  const updateProgress = (achievementId, progress) => {
    setAchievements(prev =>
      prev.map(achievement => {
        if (achievement.id === achievementId && !achievement.unlockedAt) {
          const updatedProgress = {
            current: Math.min(progress, achievement.progress.target),
            target: achievement.progress.target,
          };
          // Check if achievement should be unlocked
          if (updatedProgress.current >= updatedProgress.target) {
            unlockAchievement(achievementId);
          }
          return {
            ...achievement,
            progress: updatedProgress,
          };
        }
        return achievement;
      })
    );
  };
  // Save achievements to localStorage whenever they change
  (0, react_1.useEffect)(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);
  return (
    <AchievementContext.Provider
      value={{
        achievements,
        getProgress,
        unlockAchievement,
        updateProgress,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}
function useAchievements() {
  const context = (0, react_1.useContext)(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}
