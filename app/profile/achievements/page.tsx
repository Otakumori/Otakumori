import { generateSEO } from '@/app/lib/seo';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AchievementsTabs from '../../components/profile/AchievementsTabs';
import { t } from '@/lib/microcopy';
import { env } from '@/env.mjs';

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

export function generateMetadata() {
  return generateSEO({
    title: 'Achievements',
    description: 'View your unlocked achievements and progress.',
    url: '/profile/achievements',
  });
}

export default async function AchievementsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/profile/achievements');
  }

  const achievements = await getAchievements();

  return (
    <main className="mori-page pt-24">
      <div className="mori-shell py-10 sm:py-14">
        <header className="mb-8 max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#fff1e4] md:text-4xl">
            {t('achievements', 'title')}
          </h1>
          <p className="mt-3 text-base leading-7 text-[#cdbbb7]">{t('achievements', 'subtitle')}</p>
        </header>

        <AchievementsTabs achievements={achievements} />
      </div>
    </main>
  );
}
