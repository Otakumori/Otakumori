'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Achievement } from '@/types/achievements';

interface AchievementContextType {
  achievements: Achievement[];
  unlock: (id: string) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const AchievementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const unlock = (id: string) => {
    setAchievements(prev => prev.map(a => (a.id === id ? { ...a, unlocked: true } : a)));
  };
  return (
    <AchievementContext.Provider value={{ achievements, unlock }}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievementContext = () => {
  const context = useContext(AchievementContext);
  if (!context) throw new Error('useAchievementContext must be used within AchievementProvider');
  return context;
};

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};
