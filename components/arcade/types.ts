import { ReactNode } from 'react';

export interface EngineGame {
  id: string;
  label: string;
  durationSec: number;
  component: React.ComponentType<GameProps>;
}

export interface GameProps {
  onComplete: (score: number, petals: number) => void;
  onFail: () => void;
  duration: number;
  _onFail?: () => void;
  _duration?: number;
}

export interface ProgressData {
  bestScores: Record<string, number>;
  dailyStreak: number;
  lastPlayDate: string;
  totalPetalsEarned: number;
}

export interface Caption {
  id: string;
  text: string;
  timestamp: number;
}

export interface GameResult {
  score: number;
  petals: number;
  success: boolean;
  caption?: string;
}
