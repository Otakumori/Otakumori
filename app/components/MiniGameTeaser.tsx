import GlassPanel from './GlassPanel';
import Link from 'next/link';
import { t } from '@/lib/microcopy';

type Game = { 
  id: string; 
  slug: string; 
  title: string; 
  summary: string;
  status: 'ready' | 'beta' | 'experimental' | 'hidden';
};

// Game registry - single source of truth for all games
const GAME_REGISTRY: Game[] = [
  {
    id: 'samurai-petal-slice',
    slug: 'samurai-petal-slice',
    title: 'Samurai Petal Slice',
    summary: "Draw the Tetsusaiga's arc…",
    status: 'ready'
  },
  {
    id: 'anime-memory-match',
    slug: 'anime-memory-match', 
    title: 'Anime Memory Match',
    summary: 'Recall the faces bound by fate.',
    status: 'ready'
  },
  {
    id: 'bubble-pop-gacha',
    slug: 'bubble-pop-gacha',
    title: 'Bubble-Pop Gacha',
    summary: 'Pop for spy-craft secrets…',
    status: 'ready'
  },
  {
    id: 'petal-storm-rhythm',
    slug: 'petal-storm-rhythm',
    title: 'Petal Storm Rhythm',
    summary: "Sync to the Moon Prism's pulse.",
    status: 'ready'
  },
  {
    id: 'quick-math',
    slug: 'quick-math',
    title: 'Quick Math',
    summary: 'Answer fast. Pressure builds with each correct streak.',
    status: 'ready'
  },
  {
    id: 'dungeon-of-desire',
    slug: 'dungeon-of-desire',
    title: 'Dungeon of Desire',
    summary: 'Descend into the dungeon. Survive rooms and claim rewards.',
    status: 'beta'
  }
];

export default async function MiniGameTeaser() {
  // Filter to only ready and beta games for home page
  const featuredGames = GAME_REGISTRY
    .filter(game => game.status === 'ready' || game.status === 'beta')
    .slice(0, 6);

  return (
    <section id="games" className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          Mini-Games Hub
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          GameCube-inspired gaming experiences with petal rewards
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {featuredGames.map((game) => (
          <GlassPanel key={game.id} className="group hover:scale-105 transition-all duration-300 relative">
            <Link href={`/mini-games/${game.slug}`} className="block p-6">
              {/* Status Badge */}
              {game.status === 'beta' && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500/20 border border-yellow-400/30 rounded text-xs text-yellow-300 font-medium">
                  BETA
                </div>
              )}
              
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl text-white">🎮</span>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-3 text-center group-hover:text-pink-300 transition-colors">
                {game.title}
              </h3>
              
              <p className="text-gray-300 text-center mb-4 text-sm italic">
                {game.summary}
              </p>
              
              <div className="flex items-center justify-center text-pink-400 text-sm font-medium">
                Play Now
                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </GlassPanel>
        ))}
      </div>

      {/* View All CTA */}
      <div className="text-center">
        <Link
          href="/mini-games"
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
        >
          Enter GameCube Hub
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
