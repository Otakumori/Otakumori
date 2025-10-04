// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { getGameDef } from '@/app/lib/games';
import { type GameDefinition } from '@/app/lib/games';
import SamuraiPetalSlice from '@/components/games/SamuraiPetalSlice';
import AnimeMemoryMatch from '@/components/games/AnimeMemoryMatch';
import BubblePopGacha from '@/components/games/BubblePopGacha';
import RhythmBeatEmUp from '@/components/games/RhythmBeatEmUp';
import MemoryMatch from '@/components/games/MemoryMatch';
import QuickMath from '@/components/games/QuickMath';
import PetalCollection from '@/components/games/PetalCollection';
import GameCubeBoot from '@/app/components/GameCubeBoot';
import EnhancedLeaderboard from '@/app/components/EnhancedLeaderboard';

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
  const [showBoot, setShowBoot] = useState(true);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showLb, setShowLb] = useState(false);

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

      // Boot animation once per session
      try {
        const seen = typeof window !== 'undefined' && window.localStorage.getItem('gc_boot');
        if (seen === '1') {
          setShowBoot(false);
        }
      } catch {}
    }
  }, [isLoaded, user, gameSlug, router]);

  // Allow skip boot after 2s via click/Enter
  useEffect(() => {
    if (!showBoot) return;
    let ready = false;
    const t = setTimeout(() => (ready = true), 2000);
    const onSkip = (e: KeyboardEvent | MouseEvent) => {
      if (!ready) return;
      if (e instanceof KeyboardEvent && e.key !== 'Enter') return;
      setShowBoot(false);
      try {
        window.localStorage.setItem('gc_boot', '1');
      } catch {}
    };
    window.addEventListener('keydown', onSkip);
    window.addEventListener('click', onSkip);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onSkip);
      window.removeEventListener('click', onSkip);
    };
  }, [showBoot]);

  // Pause on tab hidden
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

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
          <div className="text-6xl mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Game Not Found</h3>
          <p className="text-gray-500 mb-4">The requested game could not be found.</p>
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
          <div className="text-6xl mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Game Under Development</h3>
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

  // Show GameCube boot first
  if (showBoot) {
    return (
      <GameCubeBoot
        onComplete={() => {
          setShowBoot(false);
          try {
            window.localStorage.setItem('gc_boot', '1');
          } catch {}
        }}
      />
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
            <h1 className="text-xl font-bold text-gray-800">{gameDef.name}</h1>

            {/* Game Info */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div
                className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${gameDef.difficulty === 'easy' ? 'bg-green-100 text-green-700' : ''}
                ${gameDef.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                ${gameDef.difficulty === 'hard' ? 'bg-red-100 text-red-700' : ''}
              `}
              >
                {gameDef.difficulty}
              </div>
              <div className="text-sm text-gray-600">Max: {gameDef.maxRewardPerRun} </div>
              <button
                onClick={() => setShowLb((s) => !s)}
                className="lg:hidden rounded-md border px-2 py-1 text-xs hover:bg-gray-100"
                aria-expanded={showLb}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setPaused((p) => !p)}
                className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100"
                aria-pressed={paused}
              >
                {paused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={toggleMute}
                className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100"
                aria-pressed={muted}
              >
                {muted ? 'Unmute' : 'Mute'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Game + Leaderboard */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative">
            {paused && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-white">
                <div className="rounded-xl bg-black/60 px-4 py-2 text-sm">Paused</div>
              </div>
            )}
            <GameComponent gameDef={gameDef} muted={muted} paused={paused} />
          </div>
          <aside className="lg:col-span-1 hidden lg:block">
            <EnhancedLeaderboard gameCode={gameSlug} />
          </aside>
        </div>
      </main>
      {showLb && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowLb(false)}
            aria-label="Close leaderboard"
          />
          <div className="ml-auto h-full w-5/6 max-w-sm bg-white shadow-xl">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="text-sm font-semibold">Leaderboard</div>
              <button className="text-sm" onClick={() => setShowLb(false)}>
                Close
              </button>
            </div>
            <div className="p-3 overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
              <EnhancedLeaderboard gameCode={gameSlug} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
