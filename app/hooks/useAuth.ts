'use client';

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuth() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerkAuth();
  const router = useRouter();

  const isSignedIn = !!user;
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.unsafeMetadata?.role === 'admin';

  const requireAuth = useCallback(
    (redirectTo?: string) => {
      if (!isLoaded) return false;
      if (!isSignedIn) {
        const url = new URL('/sign-in', window.location.origin);
        if (redirectTo) {
          url.searchParams.set('redirect_url', redirectTo);
        }
        router.push(url.toString());
        return false;
      }
      return true;
    },
    [isLoaded, isSignedIn, router],
  );

  const requireAdmin = useCallback(
    (redirectTo?: string) => {
      if (!requireAuth(redirectTo)) return false;
      if (!isAdmin) {
        router.push('/unauthorized');
        return false;
      }
      return true;
    },
    [requireAuth, isAdmin, router],
  );

  const signOutAndRedirect = useCallback(
    async (redirectTo = '/') => {
      await signOut();
      router.push(redirectTo);
    },
    [signOut, router],
  );

  return {
    user,
    isLoaded,
    isSignedIn,
    isAdmin,
    isLoading: !isLoaded,
    signOut: signOutAndRedirect,
    requireAuth,
    requireAdmin,
  };
}

export function useRequireAuth() {
  const { requireAuth } = useAuth();
  return requireAuth;
}

export function useRequireAdmin() {
  const { requireAdmin } = useAuth();
  return requireAdmin;
}
