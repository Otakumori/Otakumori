import type { Metadata } from 'next';
import StarfieldPurple from '../components/StarfieldPurple';
import NavBar from '../components/NavBar';
import FooterDark from '../components/FooterDark';
import LeaderboardInterface from '../components/community/LeaderboardInterface';
import { t } from '@/lib/microcopy';

export const metadata: Metadata = {
  title: 'Leaderboards — Otaku-mori',
  description: 'See how you rank among other travelers.',
};

import { env } from '@/env';

async function getLeaderboardData() {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_SITE_URL || ''}/api/v1/leaderboard`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) return { weekly: [], seasonal: [], userRank: null };
    return response.json();
  } catch {
    return { weekly: [], seasonal: [], userRank: null };
  }
}

export default async function LeaderboardPage() {
  const leaderboardData = await getLeaderboardData();

  return (
    <>
      <StarfieldPurple />
      <NavBar />
      <main className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white md:text-4xl mb-4">
              {t('leaderboards', 'title')}
            </h1>
            <p className="text-lg text-zinc-300/90">{t('leaderboards', 'subtitle')}</p>
          </div>

          <LeaderboardInterface leaderboardData={leaderboardData} />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
