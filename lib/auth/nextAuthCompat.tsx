/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useUser } from '@clerk/nextjs';

type Session = {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  } | null;
};

export function useSession(): {
  data: Session | null;
  status: 'authenticated' | 'unauthenticated' | 'loading';
} {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) return { data: null, status: 'loading' };
  if (!isSignedIn || !user) return { data: { user: null }, status: 'unauthenticated' };

  const primaryEmail = user.emailAddresses?.[0]?.emailAddress ?? null;
  const name =
    user.username || [user.firstName, user.lastName].filter(Boolean).join(' ') || primaryEmail;

  return {
    data: {
      user: {
        id: user.id,
        email: primaryEmail,
        name,
        image: user.imageUrl ?? null,
      },
    },
    status: 'authenticated',
  };
}

export function signIn(router: any) {
  // Push to your sign-in route (Clerk)
  router.push('/sign-in');
}

export async function signOut(clerk: any) {
  await clerk.signOut();
}
