/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { create } from 'zustand';

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  rank: number;
  achievements: number;
  level: number;
  game?: string;
  timestamp?: number;
  isCurrentUser?: boolean;
}

interface LeaderboardState {
  entries: LeaderboardEntry[];
  setEntries: (entries: LeaderboardEntry[]) => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
}));
