import { generateSEO } from '@/app/lib/seo';
import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import FooterDark from '../../components/FooterDark';
import PetalsDashboard from '../../components/profile/PetalsDashboard';
import { t } from '@/lib/microcopy';
import { env } from '@/env.mjs';

export const metadata: Metadata = {
  title: 'Petals — Otaku-mori',
  description: 'Track your petal collection and rewards.',
};

async function getPetalsData() {
  try {
    const { getToken } = await auth();
    const token = await getToken({ template: 'otakumori-jwt' });

    const siteUrl = env.NEXT_PUBLIC_SITE_URL || '';

    const [historyResponse, dailyResponse] = await Promise.all([
      fetch(`${siteUrl}/api/v1/petals/history`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      }),
      fetch(`${siteUrl}/api/v1/petals/daily`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      }),
    ]);

    const history = historyResponse.ok ? await historyResponse.json() : [];
    const daily = dailyResponse.ok ? await dailyResponse.json() : { remaining: 0, total: 100 };

    return { history, daily };
  } catch {
    return { history: [], daily: { remaining: 0, total: 100 } };
  }
}

export function generateMetadata() {
  return generateSEO({
    title: 'Profile',
    description: 'View user profile',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\profile\petals\page.tsx',
  });
}
export default async function PetalsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/profile/petals');
  }

  const petalsData = await getPetalsData();

  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen bg-[#080611]">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white md:text-4xl">{t('petals', 'title')}</h1>
            <p className="mt-2 text-zinc-300/90">{t('profile', 'petals_subtitle')}</p>
          </div>

          <PetalsDashboard petalsData={petalsData} />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
