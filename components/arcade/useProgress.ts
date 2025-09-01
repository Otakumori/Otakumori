'use client';

import { useState, useEffect } from 'react';
import { type ProgressData } from './types';

const STORAGE_KEY = 'otkm_arcade_progress';

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>({
    bestScores: {},
    dailyStreak: 0,
    lastPlayDate: '',
    totalPetalsEarned: 0,
  });

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProgress(parsed);
      }
    } catch (error) {
      console.warn('Failed to load arcade progress:', error);
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.warn('Failed to save arcade progress:', error);
    }
  }, [progress]);

  const updateBestScore = (gameId: string, score: number) => {
    setProgress((prev) => ({
      ...prev,
      bestScores: {
        ...prev.bestScores,
        [gameId]: Math.max(prev.bestScores[gameId] || 0, score),
      },
    }));
  };

  const updateDailyStreak = () => {
    const today = new Date().toDateString();
    setProgress((prev) => {
      if (prev.lastPlayDate === today) {
        return prev; // Already played today
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = prev.lastPlayDate === yesterday.toDateString();

      return {
        ...prev,
        dailyStreak: isConsecutive ? prev.dailyStreak + 1 : 1,
        lastPlayDate: today,
      };
    });
  };

  const addPetalsEarned = (amount: number) => {
    setProgress((prev) => ({
      ...prev,
      totalPetalsEarned: prev.totalPetalsEarned + amount,
    }));
  };

  const getBestScore = (gameId: string): number => {
    return progress.bestScores[gameId] || 0;
  };

  return {
    progress,
    updateBestScore,
    updateDailyStreak,
    addPetalsEarned,
    getBestScore,
  };
}
