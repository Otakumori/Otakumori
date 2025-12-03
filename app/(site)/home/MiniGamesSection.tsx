import { logger } from '@/app/lib/logger';
import { safeFetch, isSuccess } from '@/lib/safeFetch';
import Link from 'next/link';
import { getEnabledGames, getGameDef, getGameThumbnailAsset } from '@/app/lib/games';
import { paths } from '@/lib/paths';
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
  const fallbackThumbKey =
    game.thumbKey ?? getGameDef(game.slug)?.thumbKey ?? getGameDef(game.id)?.thumbKey;
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
    logger.warn('[MiniGamesSection] Failed to get registry games', undefined, registryError);
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
        logger.warn('[MiniGamesSection] Failed to map games from API', undefined, mapError);
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
    handleServerError(
      error,
      {
        section: 'mini-games',
        component: 'MiniGamesSection',
        operation: 'fetch_games',
        metadata: {
          endpoints: ['/api/v1/games', '/api/games', '/api/mini-games', '/api/games/featured'],
        },
      },
      {
        logLevel: 'warn',
      },
    );
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
              <div className="flex h-full flex-col bg-[var(--om-bg-surface)] backdrop-blur-sm border border-[var(--om-accent-gold)] rounded-lg overflow-hidden p-6 hover:border-[var(--om-accent-pink)] transition-colors">
          <div className="flex flex-col gap-3" >
          <h3 className="font-semibold text-[var(--om-text-ivory)] text-lg transition-colors group-hover:text-[var(--om-accent-pink)]" >
                      {game.title}
                    </h3>
                    {game.category && (
                      <span className="self-start rounded-full bg-[var(--om-accent-pink)]/20 backdrop-blur-sm border border-[var(--om-accent-gold)] px-3 py-1 text-xs font-medium text-[var(--om-text-ivory)]">
                        {game.category}
                      </span>
                    )
    }
                    {
    game.description && (
      <p className="text-sm text-[var(--om-text-secondary)] line-clamp-3 leading-relaxed" >
        { game.description }
        </p>
                    )
  }
  </div>
              </div>
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
      )
}
</div>
  );
}
