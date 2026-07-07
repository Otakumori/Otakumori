'use client';

import { useEffect, useMemo, useState } from 'react';

import { useAuthContext } from '@/app/contexts/AuthContext';

const CLERK_CLIENT_RECOVERY_MS = 8000;

type ClerkLikeUser = {
  username?: string | null;
  firstName?: string | null;
  fullName?: string | null;
  imageUrl?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  emailAddresses?: Array<{ emailAddress?: string | null }>;
  publicMetadata?: Record<string, unknown>;
  unsafeMetadata?: Record<string, unknown>;
};

function emailPrefix(email: string) {
  return email.split('@')[0] || 'Traveler';
}

function metadataUsername(user: ClerkLikeUser | null) {
  const publicUsername = user?.publicMetadata?.username;
  const unsafeUsername = user?.unsafeMetadata?.username;
  if (typeof publicUsername === 'string' && publicUsername.trim()) return publicUsername.trim();
  if (typeof unsafeUsername === 'string' && unsafeUsername.trim()) return unsafeUsername.trim();
  return undefined;
}

function accountEmail(user: ClerkLikeUser | null) {
  return (
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.find((email) => email.emailAddress)?.emailAddress ??
    ''
  );
}

function publicUsername(user: ClerkLikeUser | null) {
  const email = accountEmail(user);
  return (
    user?.username?.trim() || metadataUsername(user) || (email ? emailPrefix(email) : 'Traveler')
  );
}

function initialsFor(username: string) {
  return (
    username
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  );
}

export function useAccountState() {
  const auth = useAuthContext();
  const [clientTimedOut, setClientTimedOut] = useState(false);

  useEffect(() => {
    if (auth.isLoaded) {
      setClientTimedOut(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setClientTimedOut(true), CLERK_CLIENT_RECOVERY_MS);
    return () => window.clearTimeout(timer);
  }, [auth.isLoaded]);

  return useMemo(() => {
    const user = auth.user as ClerkLikeUser | null;
    const email = accountEmail(user);
    const username = publicUsername(user);
    const isUnavailable = !auth.isLoaded && clientTimedOut;

    return {
      isLoaded: auth.isLoaded,
      isSignedIn: auth.isSignedIn,
      isUnavailable,
      username,
      avatarUrl: user?.imageUrl || '',
      initials: initialsFor(username),
      email,
      signOut: auth.signOut,
      requireAuthForSoapstone: auth.requireAuthForSoapstone,
      requireAuthForWishlist: auth.requireAuthForWishlist,
    };
  }, [auth, clientTimedOut]);
}
