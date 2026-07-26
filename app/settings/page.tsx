import { generateSEO } from '@/app/lib/seo';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { AuthenticationRequiredError, requireLocalViewer } from '@/app/lib/auth/viewer';
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
    if (error instanceof AuthenticationRequiredError) return null;
    throw error;
  }

  const me = await currentUser();
  const profile = await db.userProfile.findUnique({ where: { userId: localUserId } });
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>
      {(() => {
        const initial = (profile?.gamertag ?? me?.publicMetadata?.gamertag) as string | undefined;
        return initial && <OneTapGamertagWrapper initial={initial} />;
      })()}
    </div>
  );
}
