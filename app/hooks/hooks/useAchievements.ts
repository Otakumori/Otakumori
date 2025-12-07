import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: number;
  reward: string;
  unlocked: boolean;
  icon: string;

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'petal_collector_1',
    title: 'First Bloom',
    description: 'Collect your first 10 petals',
    requirement: 10,
    reward: 'WELCOME10',
    unlocked: false,
    icon: '',
  },
  {
    id: 'petal_collector_2',
    title: 'Cherry Blossom Enthusiast',
    description: 'Collect 50 petals',
    requirement: 50,
    reward: 'BLOOM25',
    unlocked: false,
    icon: '',
  },
  {
    id: 'petal_collector_3',
    title: 'Sakura Master',
    description: 'Collect 100 petals',
    requirement: 100,
    reward: 'SAKURA50',
    unlocked: false,
    icon: '',
  },
  {
    id: 'petal_collector_4',
    title: 'Legendary Collector',
    description: 'Collect 500 petals',
    requirement: 500,
    reward: 'LEGENDARY100',
    unlocked: false,
    icon: '',
  },
];

export const useAchievements = () => {
  const [achievements, setAchievements] = useLocalStorage('achievements', ACHIEVEMENTS);
  const [showUnlock, setShowUnlock] = useState<Achievement | null>(null);

  const checkAchievements = (count: number) => {
    const newAchievements = achievements.map((achievement) => {
      if (count >= achievement.requirement && !achievement.unlocked) {
        setShowUnlock(achievement);
        return { ...achievement, unlocked: true };
      }
      return achievement;
    });
    setAchievements(newAchievements);
  };

  const getProgress = (achievement: Achievement, count: number) => {
    return Math.min(100, (count / achievement.requirement) * 100);
  };

  const getUnlockedCount = () => {
    return achievements.filter((a) => a.unlocked).length;
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
