import { generateSEO } from '@/app/lib/seo';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AchievementsTabs from '../../components/profile/AchievementsTabs';
import { t } from '@/lib/microcopy';
import { env } from '@/env.mjs';
import { approvedVisualAssets } from '@/lib/approved-visual-assets';
import { MoriArtwork } from '@/app/components/approved-art/MoriArtwork';

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
        <header className="mb-8 flex max-w-4xl flex-col items-start gap-4 sm:flex-row sm:items-center">
          <MoriArtwork
            src={approvedVisualAssets.destinations.achievements}
            className="w-32 shrink-0 sm:w-40"
            sizes="(max-width: 640px) 8rem, 10rem"
          />
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[#fff1e4] md:text-4xl">
              {t('achievements', 'title')}
            </h1>
            <p className="mt-3 text-base leading-7 text-[#cdbbb7]">
              {t('achievements', 'subtitle')}
            </p>
          </div>
        </header>

        <AchievementsTabs achievements={achievements} />
      </div>
    </main>
  );
}
