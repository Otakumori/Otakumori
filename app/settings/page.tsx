import { auth, currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import dynamic from 'next/dynamic';

const db = new PrismaClient();
const OneTapGamertag = dynamic(() => import('@/app/components/profile/OneTapGamertag'), {
  ssr: false,
});

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const me = await currentUser();
  const profile = await db.userProfile.findUnique({ where: { userId } });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>
      {(() => {
        const initial = (profile?.gamertag ?? me?.publicMetadata?.gamertag) as string | undefined;
        return initial && <OneTapGamertag initial={initial} />;
      })()}
    </div>
  );
}
