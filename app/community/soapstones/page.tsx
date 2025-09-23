import type { Metadata } from 'next';
import { env } from '@/env';
import StarfieldPurple from '../../components/StarfieldPurple';
import Navbar from '../../components/layout/Navbar';
import FooterDark from '../../components/FooterDark';
import SoapstoneCommunity from '../../components/community/SoapstoneCommunity';
import { t } from '@/lib/microcopy';

export const metadata: Metadata = {
  title: 'Soapstone Community — Otaku-mori',
  description: 'Leave messages for other travelers in the digital abyss.',
};

async function getSoapstones() {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_SITE_URL || ''}/api/v1/community/soapstones`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function SoapstoneCommunityPage() {
  const soapstones = await getSoapstones();

  return (
    <>
      <StarfieldPurple />
      <Navbar />
      <main className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white md:text-4xl mb-4">Soapstone Messages</h1>
            <p className="text-lg text-zinc-300/90">
              Leave messages for other travelers in the digital abyss
            </p>
          </div>

          <SoapstoneCommunity initialSoapstones={soapstones} />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
