'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FriendChat } from '../../components/FriendChat';
import { useFriendStore } from '../../lib/store/friendStore';
import { useLeaderboardStore } from '../../lib/store/leaderboardStore';
import type { LeaderboardEntry } from '../../lib/store/leaderboardStore';

export default function FriendProfilePage() {
  const params = useParams();
  const friendId = params?.id as string;
  const { friends } = useFriendStore();
  const { entries } = useLeaderboardStore();

  const friend = friends.find(f => f.id === friendId);
  const friendEntries = Object.entries(
    entries.reduce(
      (acc, entry) => {
        const gameKey = entry.game || 'unknown';
        if (!acc[gameKey]) {
          acc[gameKey] = [];
        }
        acc[gameKey].push(entry);
        return acc;
      },
      {} as Record<string, LeaderboardEntry[]>
    )
  )
    .flatMap(([game, gameEntries]) =>
      gameEntries.filter(entry => entry.id === friendId).map(entry => ({ ...entry, game }))
    )
    .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));

  if (!friend) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-center text-4xl font-bold text-white">Friend Not Found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Friend Profile */}
          <div className="rounded-lg bg-white/10 p-6 shadow-lg backdrop-blur-lg">
            <div className="mb-6 flex items-center space-x-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-500 text-2xl text-white">
                  {friend.name[0].toUpperCase()}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{friend.name}</h1>
              </div>
            </div>

            {/* Game Stats */}
            <div className="space-y-4">
              <h2 className="mb-4 text-xl font-semibold text-white">Game Stats</h2>
              {friendEntries.map(entry => (
                <motion.div
                  key={`${entry.game}-${entry.timestamp}`}
                  className="rounded-lg bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{entry.game}</span>
                    <span className="font-bold text-pink-400">{entry.score}</span>
                  </div>
                  <p className="text-sm text-white/50">
                    {new Date(entry.timestamp ?? Date.now()).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Section */}
          <div>
            <FriendChat />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
