'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useLeaderboardStore = void 0;
const zustand_1 = require('zustand');
const middleware_1 = require('zustand/middleware');
exports.useLeaderboardStore = (0, zustand_1.create)()(
  (0, middleware_1.persist)(
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
