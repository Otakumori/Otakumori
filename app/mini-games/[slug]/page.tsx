"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getGameDef } from '@/app/lib/games';
import { GameDefinition } from '@/app/lib/games';
import SamuraiPetalSlice from '@/components/games/SamuraiPetalSlice';
import AnimeMemoryMatch from '@/components/games/AnimeMemoryMatch';
import BubblePopGacha from '@/components/games/BubblePopGacha';
import RhythmBeatEmUp from '@/components/games/RhythmBeatEmUp';
import MemoryMatch from '@/components/games/MemoryMatch';
import QuickMath from '@/components/games/QuickMath';
import PetalCollection from '@/components/games/PetalCollection';

const gameComponents: Record<string, React.ComponentType<any>> = {
  'samurai-petal-slice': SamuraiPetalSlice,
  'anime-memory-match': AnimeMemoryMatch,
  'bubble-pop-gacha': BubblePopGacha,
  'rhythm-beat-em-up': RhythmBeatEmUp,
  'memory-match': MemoryMatch,
  'quick-math': QuickMath,
  'petal-collection': PetalCollection,
};

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [gameDef, setGameDef] = useState<GameDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const gameSlug = params.slug as string;

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/login');
        return;
      }

      const game = getGameDef(gameSlug);
      if (!game) {
        router.push('/mini-games');
        return;
      }

      setGameDef(game);
      setIsLoading(false);
    }
  }, [isLoaded, user, gameSlug, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!gameDef) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Game Not Found
          </h3>
          <p className="text-gray-500 mb-4">
            The requested game could not be found.
          </p>
          <button
            onClick={() => router.push('/mini-games')}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  const GameComponent = gameComponents[gameSlug];

  if (!GameComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Game Under Development
          </h3>
          <p className="text-gray-500 mb-4">
            {gameDef.name} is currently being developed. Check back soon!
          </p>
          <button
            onClick={() => router.push('/mini-games')}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Game Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            <button
              onClick={() => router.push('/mini-games')}
              className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <span className="text-xl">←</span>
              <span>Back to Games</span>
            </button>

            {/* Game Title */}
            <h1 className="text-xl font-bold text-gray-800">
              {gameDef.name}
            </h1>

            {/* Game Info */}
            <div className="flex items-center gap-4">
              <div className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${gameDef.difficulty === 'easy' ? 'bg-green-100 text-green-700' : ''}
                ${gameDef.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                ${gameDef.difficulty === 'hard' ? 'bg-red-100 text-red-700' : ''}
              `}>
                {gameDef.difficulty}
              </div>
              <div className="text-sm text-gray-600">
                Max: {gameDef.maxRewardPerRun} 🌸
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Game Component */}
      <main className="flex-1">
        <GameComponent gameDef={gameDef} />
      </main>
    </div>
  );
}
