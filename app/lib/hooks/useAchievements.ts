import { useState } from 'react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: Date;
  icon?: string;
  category?: string;
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const unlock = (id: string) => {
    setAchievements(prev =>
      prev.map(a => (a.id === id ? { ...a, unlocked: true, unlockedAt: new Date() } : a))
    );
  };

  const unlockAchievement = (id: string) => {
    setAchievements(prev =>
      prev.map(a => (a.id === id ? { ...a, unlocked: true, unlockedAt: new Date() } : a))
    );
  };

  return { achievements, unlock, unlockAchievement };
}
