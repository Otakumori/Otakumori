'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AchievementProvider = AchievementProvider;
exports.useAchievements = useAchievements;
const react_1 = require('react');
const defaultAchievements = [
  {
    id: 'first_purchase',
    title: 'First Purchase',
    description: 'Make your first purchase',
    icon: '🛍️',
    unlocked: false,
    progress: 0,
    total: 1,
    reward: {
      type: 'points',
      value: 100,
    },
  },
  {
    id: 'collector',
    title: 'Collector',
    description: 'Purchase 10 different items',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    total: 10,
    reward: {
      type: 'badge',
      value: 'Collector Badge',
    },
  },
  {
    id: 'big_spender',
    title: 'Big Spender',
    description: 'Spend $100 or more',
    icon: '💰',
    unlocked: false,
    progress: 0,
    total: 100,
    reward: {
      type: 'discount',
      value: 10,
    },
  },
  {
    id: 'community_member',
    title: 'Community Member',
    description: 'Join the Bonfire community',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    total: 1,
    reward: {
      type: 'points',
      value: 50,
    },
  },
  {
    id: 'reviewer',
    title: 'Product Reviewer',
    description: 'Write 5 product reviews',
    icon: '✍️',
    unlocked: false,
    progress: 0,
    total: 5,
    reward: {
      type: 'points',
      value: 200,
    },
  },
];
const AchievementContext = (0, react_1.createContext)(undefined);
function AchievementProvider({ children }) {
  const [achievements, setAchievements] = (0, react_1.useState)(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('achievements');
      return saved ? JSON.parse(saved) : defaultAchievements;
    }
    return defaultAchievements;
  });
  (0, react_1.useEffect)(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);
  const unlockAchievement = id => {
    setAchievements(current =>
      current.map(achievement =>
        achievement.id === id
          ? { ...achievement, unlocked: true, progress: achievement.total }
          : achievement
      )
    );
  };
  const updateProgress = (id, progress) => {
    setAchievements(current =>
      current.map(achievement => {
        if (achievement.id === id) {
          const newProgress = Math.min(progress, achievement.total);
          const unlocked = newProgress >= achievement.total;
          return { ...achievement, progress: newProgress, unlocked };
        }
        return achievement;
      })
    );
  };
  const getUnlockedCount = () => {
    return achievements.filter(a => a.unlocked).length;
  };
  return (
    <AchievementContext.Provider
      value={{
        achievements,
        unlockAchievement,
        updateProgress,
        getUnlockedCount,
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
