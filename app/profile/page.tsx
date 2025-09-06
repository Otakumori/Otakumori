import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import NavBar from '../components/NavBar';
import FooterDark from '../components/FooterDark';
import ProfileHub from '../components/profile/ProfileHub';
import { t } from '@/lib/microcopy';

export const metadata: Metadata = {
  title: 'Profile — Otaku-mori',
  description: 'Your personal shrine and profile management.',
};

async function getProfileData() {
  try {
    const { getToken } = await auth();
    const token = await getToken({ template: 'otakumori-jwt' });
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/v1/profile/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in?redirect_url=/profile');
  }

  const profileData = await getProfileData();

  return (
    <>
      <NavBar />
      <main className="relative z-10 min-h-screen bg-[#080611]">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              Your Shrine
            </h1>
            <p className="mt-2 text-zinc-300/90">
              {t("encouragement", "welcomeBack")}
            </p>
          </div>
          
          <ProfileHub profileData={profileData} />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
