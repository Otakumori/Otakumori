import Link from 'next/link';
import Image from 'next/image';
import GlassPanel from '../GlassPanel';

type Game = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image?: string;
  tech?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: string;
  rewards?: {
    petals: number;
    achievements: string[];
  };
};

type GamesGridProps = {
  games: Game[];
};

export default function GamesGrid({ games }: GamesGridProps) {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-zinc-400';
    }
  };

  const getTechColor = (tech?: string) => {
    switch (tech) {
      case '2D':
        return 'bg-blue-500/20 text-blue-300';
      case 'WebGL':
        return 'bg-purple-500/20 text-purple-300';
      case 'Three.js':
        return 'bg-orange-500/20 text-orange-300';
      case 'PixiJS':
        return 'bg-pink-500/20 text-pink-300';
      default:
        return 'bg-zinc-500/20 text-zinc-300';
    }
  };

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <GlassPanel className="p-8">
          <h2 className="text-xl font-semibold text-white mb-4">No games available</h2>
          <p className="text-zinc-400">Check back later for new mini-games!</p>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <GlassPanel key={game.id} className="group overflow-hidden">
          <Link href={`/games/${game.slug}`} className="block">
            <div className="relative aspect-video w-full overflow-hidden">
              {game.image ? (
                <Image
                  src={game.image}
                  alt={game.title}
                  fill
                  sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20">
                  <span className="text-4xl" role="img" aria-label="Game controller"></span>
                </div>
              )}

              {/* Tech Badge */}
              {game.tech && (
                <div
                  className={`absolute top-3 right-3 rounded-full px-2 py-1 text-xs font-medium ${getTechColor(game.tech)}`}
                >
                  {game.tech}
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-fuchsia-300 transition-colors">
                {game.title}
              </h3>

              <p className="text-sm text-zinc-300 mb-3 line-clamp-2">{game.summary}</p>

              <div className="flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-4">
                  {game.difficulty && (
                    <span className={getDifficultyColor(game.difficulty)}>
                      {game.difficulty.toUpperCase()}
                    </span>
                  )}
                  {game.estimatedTime && <span>~{game.estimatedTime}</span>}
                </div>

                {game.rewards && (
                  <div className="flex items-center gap-1">
                    <span role="img" aria-label="Cherry blossom"></span>
                    <span>+{game.rewards.petals}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </GlassPanel>
      ))}
    </div>
  );
}
