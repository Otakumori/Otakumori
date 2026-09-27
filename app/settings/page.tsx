import { generateSEO } from '@/app/lib/seo';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { AuthenticationRequiredError, requireLocalViewer } from '@/app/lib/auth/viewer';
import { buildCanonicalSignInUrl } from '@/app/lib/auth/accountUrls';
import { resolveServerAppOrigin } from '@/app/lib/auth/serverAppOrigin';
import OneTapGamertagWrapper from './OneTapGamertagWrapper';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/settings',
  });
}
export default async function SettingsPage() {
  let localUserId: string;
  try {
    ({ localUserId } = await requireLocalViewer());
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      const appOrigin = await resolveServerAppOrigin();
      return (
        <main className="om-route-page om-route-page--settings min-h-screen">
          <section className="om-route-state om-route-state--bounded mx-auto mt-16 max-w-2xl" aria-labelledby="settings-title">
            <p className="mori-foundation-eyebrow">Quiet utility chamber</p>
            <h1 id="settings-title" className="mt-3 font-display text-3xl font-semibold text-[#f6eddf]">Settings</h1>
            <p className="mt-4 text-sm leading-7 text-[#d9cdbd]">Sign in to manage your Otaku-mori preferences.</p>
            <a href={buildCanonicalSignInUrl('/settings', appOrigin)} className="mori-button-primary mt-6">Sign In</a>
          </section>
        </main>
      );
    }
    throw error;
  }

  const me = await currentUser();
  const profile = await db.userProfile.findUnique({ where: { userId: localUserId } });
  return (
    <main className="om-route-page om-route-page--settings">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="mori-foundation-eyebrow">Quiet utility chamber</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">Settings</h1>
        <div aria-hidden="true" className="om-provisional-rule mt-4" />
        {(() => {
          const initial = (profile?.gamertag ?? me?.publicMetadata?.gamertag) as string | undefined;
          return initial && <OneTapGamertagWrapper initial={initial} />;
        })()}
      </div>
    </main>
  );
}
