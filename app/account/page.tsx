import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import {
  FALLBACK_APP_ORIGIN,
  buildCanonicalSignInUrl,
  buildCanonicalUserProfileUrl,
} from '@/app/lib/auth/accountUrls';
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

  if (!userId) {
    redirect(buildCanonicalSignInUrl('/account', FALLBACK_APP_ORIGIN));
  }

  redirect(buildCanonicalUserProfileUrl('/profile', FALLBACK_APP_ORIGIN));
}
