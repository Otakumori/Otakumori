import type { Metadata } from 'next';
import StarfieldPurple from '../components/StarfieldPurple';
import Navbar from '../components/layout/Navbar';
import FooterDark from '../components/FooterDark';
import LeaderboardInterface from '../components/community/LeaderboardInterface';
import { t } from '@/lib/microcopy';

export const metadata: Metadata = {
  title: 'Leaderboards — Otaku-mori',
  description: 'See how you rank among other travelers.',
};

// Force dynamic rendering to prevent timeout during static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Use relative API path during SSR to avoid base-URL issues

async function getLeaderboardData() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`/api/v1/leaderboard`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);

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
      <Navbar />
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
