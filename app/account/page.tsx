import { UserProfile } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import {
  buildCanonicalSignInUrl,
  buildCanonicalUserProfileUrl,
  resolveClerkRouting,
} from '@/app/lib/auth/accountUrls';
import { resolveServerAppOrigin } from '@/app/lib/auth/serverAppOrigin';
import { generateSEO } from '@/app/lib/seo';

export function generateMetadata() {
  return generateSEO({
    title: 'Account & Security',
    description: 'Manage Otaku-mori account security through the hosted Clerk Account Portal.',
    url: '/account',
  });
}

export default async function AccountPage() {
  const { userId } = await auth();
  const appOrigin = await resolveServerAppOrigin();
  const routing = resolveClerkRouting(appOrigin);

  if (routing.mode === 'blocked') {
    return <main role="alert">Authentication is temporarily unavailable.</main>;
  }

  if (!userId) {
    redirect(buildCanonicalSignInUrl('/account', appOrigin));
  }

  if (routing.mode === 'production-hosted') {
    redirect(buildCanonicalUserProfileUrl('/profile', appOrigin));
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <UserProfile routing="hash" />
    </main>
  );
}
