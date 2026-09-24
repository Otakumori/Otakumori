'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import ClientErrorBoundary from '@/app/components/util/ClientErrorBoundary';
import gamesRegistry from '@/lib/games.meta.json';

const GameCubeBootSequence = dynamic(() => import('@/app/components/gamecube/GameCubeBootSequence'), {
  ssr: false,
  loading: () => <ArcadeLoading label="Loading boot sequence..." />,
});

const GameCubeHubV2 = dynamic(() => import('./_components/GameCubeHubV2'), {
  ssr: false,
  loading: () => <ArcadeLoading label="Loading arcade hub..." />,
});

function ArcadeLoading({ label }: { label: string }) {
  return (
    <div className="mori-game-shell flex min-h-screen items-center justify-center px-6">
      <div className="mori-panel-soft w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-5 h-7 w-7 animate-spin rounded-full border border-[#efc7d2]/25 border-t-[#efc7d2]/75" />
        <p className="text-sm text-[#cdbbb7]">{label}</p>
      </div>
    </div>
  );
}

function MiniGamesIntro({ onEnter }: { onEnter: () => void }) {
  const games = useMemo(
    () =>
      gamesRegistry.games
        .filter((game) => game.enabled)
        .sort((a, b) => a.order - b.order)
        .slice(0, 6),
    [],
  );

  return (
    <main className="mori-game-shell px-5 pb-20 pt-28 sm:px-8">
      <section className="mori-shell">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(32rem,1.1fr)] lg:items-end">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-[#fff1e4] sm:text-6xl">
              Mini-Games, petals, and shrine-side chaos.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#cdbbb7] sm:text-lg">
              Enter through the arcade shell or head straight to a game. Each game keeps its own
              personality, but the surrounding world stays Otaku-mori.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={onEnter} className="mori-button-primary">
                Enter Arcade Hub
              </button>
              <Link href="/mini-games/petal-samurai" className="mori-button-secondary">
                Play Petal Samurai
              </Link>
            </div>
          </div>

          <div className="mori-panel p-5 sm:p-6">
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#fff1e4]">Available games</h2>
                <p className="mt-1 text-sm text-[#8f7f7d]">Choose a path without leaving the world.</p>
              </div>
              <span className="text-xs text-[#a9855f]">{games.length} featured</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {games.map((game) => (
                <Link
                  key={game.id}
                  href={`/mini-games/${game.slug}`}
                  className="mori-game-card group min-h-36 p-4 focus:outline-none"
                >
                  <div className="text-xs uppercase tracking-[0.14em] text-[#a9855f]">
                    {game.category}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-[#fff1e4] transition-colors group-hover:text-white">
                    {game.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#cdbbb7]/80">
                    {game.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function HubClient() {
  const [bootState, setBootState] = useState<'intro' | 'boot' | 'hub'>('intro');

  const handleBootComplete = () => {
    setBootState('hub');
  };

  if (bootState === 'intro') {
    return <MiniGamesIntro onEnter={() => setBootState('boot')} />;
  }

  if (bootState === 'boot') {
    return (
      <ClientErrorBoundary>
        <GameCubeBootSequence onComplete={handleBootComplete} skipable={true} />
      </ClientErrorBoundary>
    );
  }

  return (
    <ClientErrorBoundary>
      <GameCubeHubV2 />
    </ClientErrorBoundary>
  );
}
