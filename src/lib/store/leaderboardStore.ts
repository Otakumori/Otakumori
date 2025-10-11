import { create } from 'zustand';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
  avatar?: string;
}

interface LeaderboardStore {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  fetchEntries: () => Promise<void>;
  addEntry: (entry: Omit<LeaderboardEntry, 'id' | 'rank'>) => void;
  updateEntry: (id: string, updates: Partial<LeaderboardEntry>) => void;
  removeEntry: (id: string) => void;
}

export const useLeaderboardStore = create<LeaderboardStore>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetchEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock data for now
      const mockEntries: LeaderboardEntry[] = [
        { id: '1', name: 'Player One', score: 1000, rank: 1 },
        { id: '2', name: 'Player Two', score: 950, rank: 2 },
        { id: '3', name: 'Player Three', score: 900, rank: 3 },
      ];
      set({ entries: mockEntries, isLoading: false });
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      set({ error: 'Failed to fetch leaderboard entries', isLoading: false });
    }
  },

  addEntry: (entry) => {
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Date.now().toString(),
      rank: get().entries.length + 1,
    };
    set((state) => ({
      entries: [...state.entries, newEntry]
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({ ...entry, rank: index + 1 })),
    }));
  },

  updateEntry: (id, updates) => {
    set((state) => ({
      entries: state.entries
        .map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({ ...entry, rank: index + 1 })),
    }));
  },

  removeEntry: (id) => {
    set((state) => ({
      entries: state.entries
        .filter((entry) => entry.id !== id)
        .map((entry, index) => ({ ...entry, rank: index + 1 })),
    }));
  },
}));
