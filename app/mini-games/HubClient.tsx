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
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-pink-400 border-t-transparent" />
        <p className="text-sm text-pink-100/80">{label}</p>
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(219,39,119,0.24),_transparent_34%),linear-gradient(135deg,#11061d_0%,#090511_48%,#020109_100%)] px-6 py-16 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-pink-200">
            Otaku-mori Arcade
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Mini-Games, petals, and shrine-side chaos.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-300">
            Jump straight into a game or launch the full GameCube-style hub when you want the
            animated arcade experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onEnter}
              className="rounded-full bg-pink-700 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-950/40 transition hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-200"
            >
              Enter Arcade Hub
            </button>
            <Link
              href="/mini-games/petal-samurai"
              className="rounded-full border border-white/15 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-pink-200"
            >
              Play Petal Samurai
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/mini-games/${game.slug}`}
              className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 transition hover:-translate-y-0.5 hover:border-pink-300/50 hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-pink-200"
            >
              <div className="text-sm uppercase tracking-[0.2em] text-pink-200">{game.category}</div>
              <h2 className="mt-3 text-xl font-bold text-white">{game.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-300">{game.description}</p>
            </Link>
          ))}
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
