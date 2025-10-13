'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { communityWS } from '@/lib/websocket/client';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  gameId?: string;
  maxEntries?: number;
  className?: string;
}

export default function Leaderboard({ gameId, maxEntries = 10, className = '' }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to leaderboard updates via WebSocket
    const handleLeaderboardUpdate = (message: any) => {
      if (message.type === 'leaderboard' && Array.isArray(message.data)) {
        setEntries(message.data.slice(0, maxEntries));
        setLoading(false);
      }
    };

    communityWS.on('leaderboard', handleLeaderboardUpdate);

    // Initial load
    setLoading(false);

    return () => {
      communityWS.removeListener('leaderboard', handleLeaderboardUpdate);
    };
  }, [maxEntries]);

  if (loading) {
    return (
      <div className={`bg-black/30 backdrop-blur-sm rounded-xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black/30 backdrop-blur-sm rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Top Players
        </h3>
        {gameId && (
          <span className="text-xs text-white/60 px-2 py-1 bg-white/10 rounded">{gameId}</span>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-white/60"
          >
            <p>No players yet. Be the first!</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.username}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  entry.isCurrentUser
                    ? 'bg-pink-500/20 border border-pink-500/40'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {/* Rank */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    entry.rank === 1
                      ? 'bg-yellow-500/30 text-yellow-300'
                      : entry.rank === 2
                        ? 'bg-gray-400/30 text-gray-300'
                        : entry.rank === 3
                          ? 'bg-orange-600/30 text-orange-300'
                          : 'bg-white/10 text-white/60'
                  }`}
                >
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {entry.avatar || entry.username.charAt(0).toUpperCase()}
                </div>

                {/* Username */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium truncate ${entry.isCurrentUser ? 'text-pink-300' : 'text-white'}`}
                  >
                    {entry.username}
                    {entry.isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                  </p>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-white">{entry.score.toLocaleString()}</p>
                  <p className="text-xs text-white/60">points</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
