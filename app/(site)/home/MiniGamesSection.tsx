import { safeFetch, isSuccess } from '@/lib/safeFetch';
import Link from 'next/link';
import Image from 'next/image';
import { getEnabledGames } from '@/app/lib/games';
import { paths } from '@/lib/paths';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { HeaderButton } from '@/components/ui/header-button';

type ApiGame = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  enabled?: boolean;
};

type GamesData = {
  games?: ApiGame[];
  data?: ApiGame[];
};

function mapGame(game: {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
}): ApiGame {
  return {
    ...game,
    image: game.image ?? '/assets/placeholder-game.jpg',
    enabled: true,
  };
}

export default async function MiniGamesSection() {
  const registryGames = getEnabledGames().map((game) =>
    mapGame({
      id: game.key,
      slug: game.key,
      title: game.name,
      description: game.tagline,
      image: `/assets/games/${game.thumbKey}.jpg`,
      category: game.difficulty,
    }),
  );

  let games: ApiGame[] = registryGames;

  try {
    const gamesResult = await safeFetch<GamesData>('/api/v1/games', { allowLive: true });

    if (isSuccess(gamesResult)) {
      games = (gamesResult.data?.games || []).map(mapGame);
    } else {
      const endpoints = ['/api/games', '/api/mini-games', '/api/games/featured'];
      for (const endpoint of endpoints) {
        const result = await safeFetch<GamesData>(endpoint, { allowLive: true });
        if (isSuccess(result) && (result.data?.games?.length || result.data?.data?.length)) {
          games = (result.data?.games || result.data?.data || []).map(mapGame);
          break;
        }
      }
    }
  } catch (error) {
    console.warn('MiniGamesSection: API calls failed during SSR:', error);
  }

  const enabledGames = games.filter((game) => game.enabled !== false).slice(0, 6);

  return (
    <div className="rounded-2xl p-8">
      <header className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#835D75' }}>
          Mini-Games
        </h2>
        <p className="mt-2" style={{ color: '#835D75', opacity: 0.7 }}>
          Play fun anime-inspired games and earn rewards
        </p>
      </header>

      {enabledGames.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enabledGames.map((game) => (
            <Link
              key={game.id}
              href={paths.game(game.slug)}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <GlassCard className="flex h-full flex-col">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={game.image ?? '/assets/placeholder-game.jpg'}
                    alt={game.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
                  <div className="absolute left-4 right-4 bottom-4 flex flex-col gap-2">
                    <h3 className="font-semibold text-white transition-colors group-hover:text-pink-300">
                      {game.title}
                    </h3>
                    {game.category && (
                      <span className="self-start rounded-full bg-pink-500/20 px-2 py-1 text-xs font-medium text-pink-200 backdrop-blur">
                        {game.category}
                      </span>
                    )}
                  </div>
                </div>
                {game.description && (
                  <GlassCardContent>
                    <p className="text-sm text-white/70 line-clamp-2">{game.description}</p>
                  </GlassCardContent>
                )}
              </GlassCard>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-primary mb-4">No Games Available</h3>
            <p className="text-secondary mb-6">
              We're working on adding new games. Check back soon!
            </p>
            <HeaderButton href={paths.games()}>Explore Games</HeaderButton>
          </div>
        </div>
      )}

      {enabledGames.length > 0 && (
        <div className="text-center mt-8">
          <HeaderButton href={paths.games()}>View All Games</HeaderButton>
        </div>
      )}
    </div>
  );
}
