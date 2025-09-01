 
 
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  total: number;
  reward?: {
    type: 'points' | 'badge' | 'discount';
    value: number | string;
  };
}

interface AchievementContextType {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  getUnlockedCount: () => number;
}

const defaultAchievements: Achievement[] = [
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

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('achievements');
      return saved ? JSON.parse(saved) : defaultAchievements;
    }
    return defaultAchievements;
  });

  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);

  const unlockAchievement = (id: string) => {
    setAchievements((current) =>
      current.map((achievement) =>
        achievement.id === id
          ? { ...achievement, unlocked: true, progress: achievement.total }
          : achievement,
      ),
    );
  };

  const updateProgress = (id: string, progress: number) => {
    setAchievements((current) =>
      current.map((achievement) => {
        if (achievement.id === id) {
          const newProgress = Math.min(progress, achievement.total);
          const unlocked = newProgress >= achievement.total;
          return { ...achievement, progress: newProgress, unlocked };
        }
        return achievement;
      }),
    );
  };

  const getUnlockedCount = () => {
    return achievements.filter((a) => a.unlocked).length;
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

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}
