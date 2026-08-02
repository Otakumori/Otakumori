import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { buildCanonicalSignInUrl, buildCanonicalUserProfileUrl } from '@/app/lib/auth/accountUrls';
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

  if (!userId) {
    redirect(buildCanonicalSignInUrl('/account', appOrigin));
  }

  redirect(buildCanonicalUserProfileUrl('/profile', appOrigin));
}
