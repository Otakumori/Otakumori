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

function renderRankBadge(rank: number) {
  if (rank > 3) {
    return <span aria-label={`Rank ${rank}`}>{rank}</span>;
  }

  const rankLabels: Record<number, string> = {
    1: 'first place',
    2: 'second place',
    3: 'third place',
  };

  const rankText: Record<number, string> = {
    1: '1st',
    2: '2nd',
    3: '3rd',
  };

  return (
    <span aria-label={`${rankLabels[rank]} badge`} className="font-semibold">
      {rankText[rank]}
    </span>
  );
}

export default function Leaderboard({ gameId, maxEntries = 10, className = '' }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLeaderboardUpdate = (message: unknown) => {
      if (
        typeof message === 'object' &&
        message !== null &&
        (message as { type?: string }).type === 'leaderboard' &&
        Array.isArray((message as { data?: unknown }).data)
      ) {
        const mappedEntries = (message as { data: LeaderboardEntry[] }).data.slice(0, maxEntries);
        setEntries(mappedEntries);
        setLoading(false);
      }
    };

    communityWS.on('leaderboard', handleLeaderboardUpdate);
    setLoading(false);

    return () => {
      communityWS.removeListener('leaderboard', handleLeaderboardUpdate);
    };
  }, [maxEntries]);

  if (loading) {
    return (
      <div className={`rounded-xl bg-black/30 p-6 backdrop-blur-sm ${className}`}>
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-1/3 rounded bg-white/10" />
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-12 rounded bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-black/30 p-6 backdrop-blur-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xl font-bold text-white">
          <span className="text-2xl" role="img" aria-label="trophy">
            <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
          </span>
          Top Players
        </h3>
        {gameId && (
          <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/60">{gameId}</span>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8 text-center text-white/60"
          >
            <p>No players yet. Be the first!</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <motion.div
                key={`${entry.username}-${entry.rank}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                  entry.isCurrentUser
                    ? 'border border-pink-500/40 bg-pink-500/20'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold ${
                    entry.rank === 1
                      ? 'bg-yellow-500/30 text-yellow-300'
                      : entry.rank === 2
                        ? 'bg-gray-400/30 text-gray-300'
                        : entry.rank === 3
                          ? 'bg-orange-600/30 text-orange-300'
                          : 'bg-white/10 text-white/60'
                  }`}
                >
                  {renderRankBadge(entry.rank)}
                </div>

                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold">
                  {entry.avatar || entry.username.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate font-medium ${
                      entry.isCurrentUser ? 'text-pink-300' : 'text-white'
                    }`}
                  >
                    {entry.username}
                    {entry.isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                  </p>
                </div>

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
