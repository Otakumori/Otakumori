'use client';

import dynamic from 'next/dynamic';
import NavBar from '../../components/NavBar';
import FooterDark from '../../components/FooterDark';

// Dynamic import to avoid SSR issues with game components
const Game404 = dynamic(() => import('../../components/games/Game404'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-4xl">🎮</div>
        <div className="text-white">Loading 404 Adventure...</div>
      </div>
    </div>
  ),
});

export default function Game404Page() {
  return (
    <>
      <NavBar />
      <main className="relative z-10 min-h-screen bg-[#080611]">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white md:text-4xl mb-2">404 Adventure</h1>
            <p className="text-zinc-300/90">
              A special mini-game for when you get lost in the digital abyss
            </p>
          </div>

          <Game404 />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
