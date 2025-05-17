import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  game: string;
  timestamp: number;
}

interface LeaderboardState {
  entries: LeaderboardEntry[];
  addEntry: (entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>) => void;
  getTopScores: (game: string, limit: number) => LeaderboardEntry[];
  getUserRank: (username: string, game: string) => number;
  clearLeaderboard: () => void;
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: entry =>
        set(state => ({
          entries: [
            ...state.entries,
            {
              ...entry,
              id: Math.random().toString(),
              timestamp: Date.now(),
            },
          ],
        })),
      getTopScores: (game, limit) => {
        const state = get();
        return state.entries
          .filter(entry => entry.game === game)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      },
      getUserRank: (username, game) => {
        const state = get();
        const gameEntries = state.entries
          .filter(entry => entry.game === game)
          .sort((a, b) => b.score - a.score);
        const userIndex = gameEntries.findIndex(entry => entry.username === username);
        return userIndex + 1;
      },
      clearLeaderboard: () => set({ entries: [] }),
    }),
    {
      name: 'leaderboard',
    }
  )
);
