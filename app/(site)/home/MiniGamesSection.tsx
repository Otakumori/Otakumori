import { safeFetch, isSuccess } from '@/lib/safeFetch';
import Link from 'next/link';
import Image from 'next/image';

interface Game {
  id: string;
  title: string;
  description?: string;
  image?: string;
  slug: string;
  category?: string;
  enabled?: boolean;
}

interface GamesData {
  games?: Game[];
  data?: Game[];
}

export default async function MiniGamesSection() {
  // Try multiple endpoints sequentially
  const endpoints = ['/api/games', '/api/mini-games', '/api/games/featured'];

  let games: Game[] = [];
  let isBlockedData = true;

  for (const endpoint of endpoints) {
    const result = await safeFetch<GamesData>(endpoint, { allowLive: true });

    if (isSuccess(result)) {
      games = result.data?.games || result.data?.data || [];
      isBlockedData = false;
      break;
    }
  }

  // If all endpoints are blocked, show CTA
  if (isBlockedData) {
    return (
      <div className="space-y-6">
        <header className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-pink-200">Mini-Games</h2>
          <p className="text-pink-200/70 mt-2">Play fun anime-inspired games and earn rewards</p>
        </header>

        <div className="text-center py-12">
          <div className="glass-panel rounded-2xl p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-pink-200 mb-4">Games Coming Soon</h3>
            <p className="text-pink-200/70 mb-6">
              We're preparing exciting mini-games for you. Stay tuned!
            </p>
            <Link href="/mini-games" className="btn-primary inline-block">
              Explore Games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter enabled games and limit to 6
  const enabledGames = games.filter((game) => game.enabled !== false).slice(0, 6);

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-pink-200">Mini-Games</h2>
        <p className="text-pink-200/70 mt-2">Play fun anime-inspired games and earn rewards</p>
      </header>

      {enabledGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enabledGames.map((game) => (
            <Link key={game.id} href={`/mini-games/games/${game.slug}`} className="group block">
              <div className="glass-panel rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={game.image || '/assets/placeholder-game.jpg'}
                    alt={game.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-semibold text-white group-hover:text-pink-100 transition-colors">
                      {game.title}
                    </h3>
                    {game.category && (
                      <span className="text-xs text-pink-200/70 bg-pink-500/20 px-2 py-1 rounded-full">
                        {game.category}
                      </span>
                    )}
                  </div>
                </div>
                {game.description && (
                  <div className="p-4">
                    <p className="text-pink-200/70 text-sm line-clamp-2">{game.description}</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="glass-panel rounded-2xl p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-pink-200 mb-4">No Games Available</h3>
            <p className="text-pink-200/70 mb-6">
              We're working on adding new games. Check back soon!
            </p>
            <Link href="/mini-games" className="btn-primary inline-block">
              Explore Games
            </Link>
          </div>
        </div>
      )}

      {enabledGames.length > 0 && (
        <div className="text-center mt-8">
          <Link href="/mini-games" className="btn-secondary inline-block">
            View All Games
          </Link>
        </div>
      )}
    </div>
  );
}
