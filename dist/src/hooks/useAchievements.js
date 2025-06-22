'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useAchievements = void 0;
const react_1 = require('react');
const useLocalStorage_1 = require('./useLocalStorage');
const ACHIEVEMENTS = [
  {
    id: 'petal_collector_1',
    title: 'First Bloom',
    description: 'Collect your first 10 petals',
    requirement: 10,
    reward: 'WELCOME10',
    unlocked: false,
    icon: '🌸',
  },
  {
    id: 'petal_collector_2',
    title: 'Cherry Blossom Enthusiast',
    description: 'Collect 50 petals',
    requirement: 50,
    reward: 'BLOOM25',
    unlocked: false,
    icon: '🌺',
  },
  {
    id: 'petal_collector_3',
    title: 'Sakura Master',
    description: 'Collect 100 petals',
    requirement: 100,
    reward: 'SAKURA50',
    unlocked: false,
    icon: '🌹',
  },
  {
    id: 'petal_collector_4',
    title: 'Legendary Collector',
    description: 'Collect 500 petals',
    requirement: 500,
    reward: 'LEGENDARY100',
    unlocked: false,
    icon: '🏆',
  },
];
const useAchievements = () => {
  const [achievements, setAchievements] = (0, useLocalStorage_1.useLocalStorage)(
    'achievements',
    ACHIEVEMENTS
  );
  const [showUnlock, setShowUnlock] = (0, react_1.useState)(null);
  const checkAchievements = count => {
    const newAchievements = achievements.map(achievement => {
      if (count >= achievement.requirement && !achievement.unlocked) {
        setShowUnlock(achievement);
        return { ...achievement, unlocked: true };
      }
      return achievement;
    });
    setAchievements(newAchievements);
  };
  const getProgress = (achievement, count) => {
    return Math.min(100, (count / achievement.requirement) * 100);
  };
  const getUnlockedCount = () => {
    return achievements.filter(a => a.unlocked).length;
  };
  return {
    achievements,
    showUnlock,
    setShowUnlock,
    checkAchievements,
    getProgress,
    getUnlockedCount,
  };
};
exports.useAchievements = useAchievements;
