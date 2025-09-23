import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import FooterDark from '../../components/FooterDark';
import AchievementsTabs from '../../components/profile/AchievementsTabs';
import { t } from '@/lib/microcopy';
import { env } from '@/env.mjs';

export const metadata: Metadata = {
  title: 'Achievements — Otaku-mori',
  description: 'View your unlocked achievements and progress.',
};

async function getAchievements() {
  try {
    const { getToken } = await auth();
    const token = await getToken({ template: 'otakumori-jwt' });

    const response = await fetch(`${env.NEXT_PUBLIC_SITE_URL || ''}/api/v1/achievements/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function AchievementsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/profile/achievements');
  }

  const achievements = await getAchievements();

  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen bg-[#080611]">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              {t('achievements', 'title')}
            </h1>
            <p className="mt-2 text-zinc-300/90">{t('achievements', 'subtitle')}</p>
          </div>

          <AchievementsTabs achievements={achievements} />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
