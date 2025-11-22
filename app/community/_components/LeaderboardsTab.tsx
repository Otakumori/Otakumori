'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  clerkId: string | null;
  displayName: string;
  avatarUrl: string | null;
  lifetimePetalsEarned: number;
  currentBalance: number;
}

interface GameLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  category: string;
}

export function LeaderboardsTab() {
  const { user } = useUser();
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [gameLeaderboards, setGameLeaderboards] = useState<Record<string, GameLeaderboardEntry[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboards() {
      try {
        setLoading(true);

        // Fetch global petal leaderboard
        const globalResponse = await fetch('/api/v1/leaderboards/global-petals?limit=20');
        if (globalResponse.ok) {
          const globalData = await globalResponse.json();
          if (globalData.ok && globalData.data) {
            setGlobalLeaderboard(globalData.data.leaderboard || []);
          }
        }

        // Fetch game-specific leaderboards (for all 9 mini-games)
        const games = [
          'petal-samurai',
          'petal-storm-rhythm',
          'memory-match',
          'bubble-girl',
          'puzzle-reveal',
          'otaku-beat-em-up',
          'dungeon-of-desire',
          'thigh-coliseum',
          'blossomware',
        ];
        const gameData: Record<string, GameLeaderboardEntry[]> = {};

        for (const gameId of games) {
          try {
            const gameResponse = await fetch(
              `/api/v1/leaderboards/${gameId}?category=score&limit=10`,
            );
            if (gameResponse.ok) {
              const gameResult = await gameResponse.json();
              if (gameResult.ok && gameResult.data?.leaderboard) {
                gameData[gameId] = gameResult.data.leaderboard.slice(0, 10);
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch leaderboard for ${gameId}:`, err);
          }
        }

        setGameLeaderboards(gameData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboards');
        console.error('Error fetching leaderboards:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboards();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-pulse text-zinc-400">Loading leaderboards...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-400 mb-2">Failed to load leaderboards</p>
          <p className="text-sm text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  const currentUserId = user?.id;

  return (
    <div className="space-y-8">
      {/* Global Petal Leaderboard */}
      <div className="bg-white/10 rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-semibold text-white mb-4">Global Petal Leaderboard</h2>
        <p className="text-sm text-zinc-300 mb-6">Top players by lifetime petals earned</p>

        {globalLeaderboard.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-400">Leaderboards are warming up...</p>
            <p className="text-xs text-zinc-500 mt-2">
              Play games and earn petals to see rankings!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {globalLeaderboard.map((entry) => {
              const isCurrentUser = entry.clerkId === currentUserId;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    isCurrentUser
                      ? 'bg-pink-500/20 border-pink-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1
                          ? 'bg-yellow-500 text-black'
                          : entry.rank === 2
                            ? 'bg-gray-400 text-black'
                            : entry.rank === 3
                              ? 'bg-orange-600 text-white'
                              : 'bg-white/10 text-white'
                      }`}
                    >
                      {entry.rank}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {entry.displayName}
                        {isCurrentUser && <span className="ml-2 text-xs text-pink-300">(You)</span>}
                      </div>
                      <div className="text-xs text-zinc-400">
                        Balance: {entry.currentBalance.toLocaleString()} petals
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-pink-300">
                      {entry.lifetimePetalsEarned.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-400">lifetime petals</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Game Leaderboards */}
      <div className="bg-white/10 rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-semibold text-white mb-4">Game Leaderboards</h2>
        <p className="text-sm text-zinc-300 mb-6">Top scores by game</p>

        {Object.keys(gameLeaderboards).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-400">No game leaderboards available yet</p>
            <p className="text-xs text-zinc-500 mt-2">Play mini-games to see rankings!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(gameLeaderboards).map(([gameId, entries]) => {
              const gameName = gameId
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return (
                <div key={gameId} className="border border-white/10 rounded-lg p-4 bg-white/5">
                  <h3 className="text-lg font-semibold text-white mb-3">{gameName}</h3>
                  {entries.length === 0 ? (
                    <p className="text-sm text-zinc-400">No scores yet</p>
                  ) : (
                    <div className="space-y-2">
                      {entries.map((entry) => (
                        <div
                          key={`${entry.userId}-${entry.score}`}
                          className="flex items-center justify-between p-2 rounded bg-white/5"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-semibold text-zinc-300 w-6">
                              #{entry.rank}
                            </span>
                            <span className="text-sm text-white">{entry.displayName}</span>
                          </div>
                          <div className="text-sm font-semibold text-pink-300">
                            {entry.score.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
