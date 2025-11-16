'use client';

import Link from 'next/link';

interface GameStat {
  gameId: string;
  displayName: string;
  bestScore?: number;
  petalsEarned?: number;
  link: string;
}

/**
 * Mini-game stats component
 * Shows cards for each implemented game with stats
 */
export default function MiniGameStats() {
  // TODO: Fetch real per-game stats from API
  // For now, show placeholder cards for implemented games
  const games: GameStat[] = [
    {
      gameId: 'petal-samurai',
      displayName: 'Petal Samurai',
      link: '/mini-games/petal-samurai',
    },
    {
      gameId: 'petal-storm-rhythm',
      displayName: 'Petal Storm Rhythm',
      link: '/mini-games/petal-storm-rhythm',
    },
  ];

  return (
    <div className="space-y-4">
      {games.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-white/10 bg-white/5">
          <p className="text-zinc-400 mb-2">You haven't logged any mini-game runs yet.</p>
          <p className="text-sm text-zinc-500">
            Try <Link href="/mini-games/petal-samurai" className="text-pink-400 hover:text-pink-300">Petal Samurai</Link> or{' '}
            <Link href="/mini-games/petal-storm-rhythm" className="text-pink-400 hover:text-pink-300">Petal Storm Rhythm</Link> to start filling this out.
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
                  <p className="text-sm text-zinc-400">Best Score: {game.bestScore.toLocaleString()}</p>
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

