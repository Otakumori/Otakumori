'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useAchievements = void 0;
const zustand_1 = require('zustand');
const middleware_1 = require('zustand/middleware');
const DEFAULT_ACHIEVEMENTS = [
  {
    id: 'kojima_fan',
    name: 'Kojima Fan',
    description: 'You found the secret code!',
    icon: '⚔️',
  },
  {
    id: 'hidden_gem',
    name: 'Hidden Gem',
    description: 'You found a secret!',
    icon: '❈',
  },
  {
    id: 'petal_master',
    name: 'Petal Master',
    description: 'Collected 1000 petals',
    icon: '✿',
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Made 10 friends',
    icon: '✧',
  },
  {
    id: 'memory_master',
    name: 'Memory Master',
    description: 'Solved 50 memory puzzles',
    icon: '❋',
  },
  {
    id: 'trade_king',
    name: 'Trade King',
    description: 'Completed 100 trades',
    icon: '⚜️',
  },
  {
    id: 'avatar_creator',
    name: 'Avatar Creator',
    description: 'Created your first avatar',
    icon: '🎭',
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Joined during the beta',
    icon: '❆',
  },
];
exports.useAchievements = (0, zustand_1.create)()(
  (0, middleware_1.persist)(
    (set, get) => ({
      achievements: DEFAULT_ACHIEVEMENTS,
      unlockedAchievements: [],
      unlockAchievement: id => {
        const achievement = get().achievements.find(a => a.id === id);
        if (!achievement || get().isUnlocked(id)) return;
        set(state => ({
          unlockedAchievements: [...state.unlockedAchievements, id],
          achievements: state.achievements.map(a =>
            a.id === id ? { ...a, unlockedAt: Date.now() } : a
          ),
        }));
      },
      isUnlocked: id => get().unlockedAchievements.includes(id),
    }),
    {
      name: 'achievements',
    }
  )
);
