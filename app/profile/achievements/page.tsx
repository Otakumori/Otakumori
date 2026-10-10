import { generateSEO } from '@/app/lib/seo';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AchievementsTabs, { type Achievement } from '../../components/profile/AchievementsTabs';
import { extractAchievements } from './_data/response';
import { t } from '@/lib/microcopy';
import { env } from '@/env.mjs';
import { approvedVisualAssets } from '@/lib/approved-visual-assets';
import { MoriArtwork } from '@/app/components/approved-art/MoriArtwork';
import {
  CommanderArchiveHeading,
  CommanderArchiveShell,
} from '@/app/components/commander/CommanderArchive';

async function getAchievements(): Promise<Achievement[]> {
  try {
    const { getToken } = await auth();
    const token = await getToken({ template: 'otakumori-jwt' });

    const response = await fetch(`${env.NEXT_PUBLIC_SITE_URL || ''}/api/v1/achievements/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    if (!response.ok) return [];
    return extractAchievements(await response.json());
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
    <CommanderArchiveShell current="achievements" className="mori-page">
      <CommanderArchiveHeading
        title={t('achievements', 'title')}
        description={t('achievements', 'subtitle')}
        artwork={
          <MoriArtwork
            src={approvedVisualAssets.destinations.achievements}
            className="w-full"
            sizes="(max-width: 640px) 7rem, 10rem"
          />
        }
      />

      <AchievementsTabs achievements={achievements} />
    </CommanderArchiveShell>
  );
}
