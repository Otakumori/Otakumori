import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { buildCanonicalSignInUrl } from '@/app/lib/auth/accountUrls';
import { resolveServerAppOrigin } from '@/app/lib/auth/serverAppOrigin';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect(buildCanonicalSignInUrl('/account', await resolveServerAppOrigin()));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      {children}
    </div>
  );
}
