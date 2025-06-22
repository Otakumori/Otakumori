'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Leaderboard = void 0;
const leaderboardStore_1 = require('@/lib/store/leaderboardStore');
const framer_motion_1 = require('framer-motion');
const AsciiArt_1 = require('./AsciiArt');
const Leaderboard = () => {
  const entries = (0, leaderboardStore_1.useLeaderboardStore)(state => state.entries);
  const topScores = entries.slice(0, 10);
  return (
    <div className="rounded-lg bg-white/10 p-6 shadow-lg backdrop-blur-lg">
      <div className="mb-6 flex items-center gap-4">
        <AsciiArt_1.AsciiArt type="leaderboard" className="text-2xl" />
        <h2 className="text-2xl font-bold text-pink-400">Leaderboard</h2>
      </div>
      <div className="space-y-4">
        {topScores.map((entry, index) => (
          <framer_motion_1.motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between rounded-lg bg-white/5 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-400">
                <span className="font-bold text-white">{index + 1}</span>
              </div>
              <div>
                <h3 className="font-semibold text-pink-400">{entry.username}</h3>
                <p className="text-sm text-gray-400">{entry.game}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-pink-400">{entry.score}</p>
              <p className="text-sm text-gray-400">
                {new Date(entry.timestamp).toLocaleDateString()}
              </p>
            </div>
          </framer_motion_1.motion.div>
        ))}
        {topScores.length === 0 && <p className="text-center text-gray-400">No scores yet</p>}
      </div>
    </div>
  );
};
exports.Leaderboard = Leaderboard;
