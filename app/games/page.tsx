import type { Metadata } from 'next';
import StarfieldPurple from '../components/StarfieldPurple';
import NavBar from '../components/NavBar';
import FooterDark from '../components/FooterDark';
import GamesGrid from '../components/games/GamesGrid';
import { t } from '@/lib/microcopy';
import { env } from '@/env.mjs';

export const metadata: Metadata = {
  title: 'Games — Otaku-mori',
  description: 'Play mini-games and earn rewards.',
};

async function getGames() {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_SITE_URL || ''}/api/v1/games`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function GamesPage() {
  const games = await getGames();

  return (
    <>
      <StarfieldPurple />
      <NavBar />
      <main className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white md:text-4xl">{t('nav', 'miniGames')}</h1>
            <p className="mt-2 text-zinc-300/90">
              Play mini-games and earn petals and achievements
            </p>
          </div>

          <GamesGrid games={games} />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
