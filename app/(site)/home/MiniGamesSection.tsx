import { safeFetch, isSuccess } from '@/lib/safeFetch';
import Link from 'next/link';
import Image from 'next/image';
import { getEnabledGames, getGameDef, getGameThumbnailAsset } from '@/app/lib/games';
import { paths } from '@/lib/paths';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { HeaderButton } from '@/components/ui/header-button';
import { handleServerError } from '@/app/lib/server-error-handler';
import { SectionHeader } from '@/app/components/home/SectionHeader';
import { EmptyState } from '@/app/components/home/EmptyState';

type ApiGame = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  enabled?: boolean;
  thumbKey?: string;
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
  thumbKey?: string;
}): ApiGame {
  const fallbackThumbKey = game.thumbKey ?? getGameDef(game.slug)?.thumbKey ?? getGameDef(game.id)?.thumbKey;
  const resolvedImage =
    game.image ??
    (fallbackThumbKey ? getGameThumbnailAsset(fallbackThumbKey) : '/assets/placeholder-game.jpg');

  return {
    ...game,
    image: resolvedImage,
    enabled: true,
  };
}

/**
 * MiniGamesSection Server Component - NEVER throws errors.
 * All errors are caught and logged, always returns renderable content.
 */
export default async function MiniGamesSection() {
  // Safely get registry games with fallback
  let registryGames: ApiGame[] = [];
  try {
    const enabledGames = getEnabledGames();
    registryGames = enabledGames
      .filter((game) => game && game.key && game.name)
      .map((game) =>
        mapGame({
          id: game.key,
          slug: game.key,
          title: game.name,
          description: game.tagline,
          thumbKey: game.thumbKey,
          category: game.difficulty,
        }),
      );
  } catch (registryError) {
    console.warn('[MiniGamesSection] Failed to get registry games:', registryError);
    registryGames = [];
  }

  let games: ApiGame[] = registryGames;

  try {
    const gamesResult = await safeFetch<GamesData>('/api/v1/games', { allowLive: true });

    if (isSuccess(gamesResult)) {
      try {
        const rawGames = gamesResult.data?.games || [];
        games = Array.isArray(rawGames) ? rawGames.map(mapGame) : registryGames;
      } catch (mapError) {
        console.warn('[MiniGamesSection] Failed to map games from API:', mapError);
        games = registryGames;
      }
    } else {
      const endpoints = ['/api/games', '/api/mini-games', '/api/games/featured'];
      for (const endpoint of endpoints) {
        try {
          const result = await safeFetch<GamesData>(endpoint, { allowLive: true });
          if (isSuccess(result) && (result.data?.games?.length || result.data?.data?.length)) {
            const rawGames = result.data?.games || result.data?.data || [];
            games = Array.isArray(rawGames) ? rawGames.map(mapGame) : registryGames;
            break;
          }
        } catch {
          // Continue to next endpoint
          continue;
        }
      }
    }
  } catch (error) {
    handleServerError(error, {
      section: 'mini-games',
      component: 'MiniGamesSection',
      operation: 'fetch_games',
      metadata: {
        endpoints: ['/api/v1/games', '/api/games', '/api/mini-games', '/api/games/featured'],
      },
    }, {
      logLevel: 'warn',
    });
    // Keep registryGames as fallback
    games = registryGames;
  }

  // Safely filter and slice games
  const enabledGames = Array.isArray(games)
    ? games.filter((game) => game && game.enabled !== false).slice(0, 6)
    : [];

  return (
    <div className="rounded-2xl p-8">
      <SectionHeader
        title="Mini-Games"
        description="Play fun anime-inspired games and earn rewards"
      />

      {enabledGames.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enabledGames.map((game) => (
            <Link
              key={game.id}
              href={paths.game(game.slug)}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-transform duration-200 hover:scale-[1.02]"
            >
              <GlassCard className="flex h-full flex-col overflow-hidden">
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                  <Image
                    src={game.image ?? '/assets/placeholder-game.jpg'}
                    alt={game.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent transition-opacity duration-300 group-hover:from-black/90" />
                  
                  {/* Game info overlay */}
                  <div className="absolute left-4 right-4 bottom-4 flex flex-col gap-2 z-10">
                    <h3 className="font-semibold text-white text-lg transition-colors group-hover:text-pink-300 drop-shadow-lg">
                      {game.title}
                    </h3>
                    {game.category && (
                      <span className="self-start rounded-full bg-pink-500/30 backdrop-blur-sm border border-pink-400/20 px-3 py-1 text-xs font-medium text-pink-100">
                        {game.category}
                      </span>
                    )}
                  </div>
                </div>
                {game.description && (
                  <GlassCardContent className="flex-1">
                    <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">{game.description}</p>
                  </GlassCardContent>
                )}
              </GlassCard>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Games Available"
          description="We're working on adding new games. Check back soon!"
          actionLabel="Explore Games"
          actionHref={paths.games()}
        />
      )}

      {enabledGames.length > 0 && (
        <div className="text-center mt-8">
          <HeaderButton href={paths.games()}>View All Games</HeaderButton>
        </div>
      )}
    </div>
  );
}
