"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";
import type { PropsWithChildren } from "react";

/**
 * Minimal compatibility layer:
 * - Most code only uses `useUser()` from supabase helpers.
 * - If something used the provider, we just passthrough children.
 */

export function useUser() {
  const { user, isLoaded, isSignedIn } = useClerkUser();
  return {
    user: isLoaded && isSignedIn ? {
      id: user?.id,
      email: user?.emailAddresses?.[0]?.emailAddress,
      user_metadata: {
        // add anything your old code expects here
        name: user?.username || [user?.firstName, user?.lastName].filter(Boolean).join(" "),
        image_url: user?.imageUrl,
      },
    } : null,
    isLoading: !isLoaded,
  };
}

// In case something wraps with <SessionContextProvider> from supabase helpers:
export function SessionContextProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}
