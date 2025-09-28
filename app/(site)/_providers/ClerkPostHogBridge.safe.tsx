'use client';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';

export default function ClerkPostHogBridge() {
  const { isSignedIn, user } = useUser();
  useEffect(() => {
    if (!posthog || typeof window === 'undefined') return;
    if (isSignedIn && user) {
      // Use stable Clerk user.id; avoid PII unless consented
      posthog.identify(user.id, {
        plan: user.publicMetadata?.plan ?? 'free',
        role: user.publicMetadata?.role ?? 'user',
      });
    } else {
      posthog.reset();
    }
  }, [isSignedIn, user]);
  return null;
}
