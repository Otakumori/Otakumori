'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getGameDisplayName } from '@/app/mini-games/_shared/gameVisuals';

interface GameStat {
  gameId: string;
  displayName: string;
  bestScore?: number;
  petalsEarned?: number;
  link: string;
}

interface GameStatsResponse {
  ok: boolean;
  data?: {
    stats: Array<{
      gameId: string;
      bestScore?: number;
      petalsEarned?: number;
      gamesPlayed: number;
    }>;
    totalGames: number;
  };
  error?: string;
}

/**
 * Mini-game stats component
 * Fetches real per-game stats from API
 */
export default function MiniGameStats() {
  const [games, setGames] = useState<GameStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/games/stats');
        const data: GameStatsResponse = await response.json();

        if (data.ok && data.data) {
          // Map API stats to component format with display names
          const gameStats: GameStat[] = data.data.stats.map((stat) => ({
            gameId: stat.gameId,
            displayName: getGameDisplayName(stat.gameId) || stat.gameId,
            bestScore: stat.bestScore,
            petalsEarned: stat.petalsEarned,
            link: `/mini-games/${stat.gameId}`,
          }));

          // If no stats, show placeholder games
          if (gameStats.length === 0) {
            gameStats.push(
    {
      gameId: 'petal-samurai',
                displayName: getGameDisplayName('petal-samurai') || 'Petal Samurai',
      link: '/mini-games/petal-samurai',
    },
    {
      gameId: 'petal-storm-rhythm',
                displayName: getGameDisplayName('petal-storm-rhythm') || 'Petal Storm Rhythm',
      link: '/mini-games/petal-storm-rhythm',
    },
            );
          }

          setGames(gameStats);
        } else {
          setError(data.error || 'Failed to load stats');
        }
      } catch (err) {
        setError('Failed to load stats');
        console.error('Game stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12 rounded-xl border border-white/10 bg-white/5">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-sm text-zinc-400">Loading stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {games.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-white/10 bg-white/5">
          <p className="text-zinc-400 mb-2">You haven't logged any mini-game runs yet.</p>
          <p className="text-sm text-zinc-500">
            Try{' '}
            <Link href="/mini-games/petal-samurai" className="text-pink-400 hover:text-pink-300">
              Petal Samurai
            </Link>{' '}
            or{' '}
            <Link
              href="/mini-games/petal-storm-rhythm"
              className="text-pink-400 hover:text-pink-300"
            >
              Petal Storm Rhythm
            </Link>{' '}
            to start filling this out.
          </p>
        </div>
      ) : (
        games.map((game) => (
          <Link
            key={game.gameId}
            href={game.link}
            className="block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">{game.displayName}</h4>
                {game.bestScore !== undefined ? (
                  <p className="text-sm text-zinc-400">
                    Best Score: {game.bestScore.toLocaleString()}
                  </p>
                ) : game.petalsEarned !== undefined ? (
                  <p className="text-sm text-zinc-400">
                    {game.petalsEarned.toLocaleString()} petals earned
                  </p>
                ) : (
                  <p className="text-sm text-zinc-400">Play to see your stats</p>
                )}
              </div>
              <div className="text-pink-400">→</div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
