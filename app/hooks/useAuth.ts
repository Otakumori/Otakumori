'use client';

import { useAuthContext } from '../contexts/AuthContext';
import { useUser } from '@clerk/nextjs';

// This hook now delegates to the main AuthContext to avoid conflicts
export function useAuth() {
  const authContext = useAuthContext();
  const { user: _user } = useUser();

  // Use AuthContext values for consistent modal behavior
  return {
    user: authContext.user,
    isLoaded: authContext.isLoaded,
    isSignedIn: authContext.isSignedIn,
    isAdmin: authContext.isAdmin,
    isLoading: authContext.isLoading,
    signOut: authContext.signOut,
    // Use modal intercepts instead of hard navigation
    requireAuth: (action?: (() => void) | string, fallbackMessage?: string) => {
      if (typeof action === 'string') {
        // Legacy support for redirectTo string
        if (!authContext.isSignedIn) {
          authContext.openAuthModal('sign-in', action, fallbackMessage);
          return false;
        }
        return true;
      } else if (typeof action === 'function') {
        // New modal intercept behavior
        authContext.requireAuth(action, fallbackMessage);
        return true;
      } else {
        // Just check auth status
        return authContext.isSignedIn;
      }
    },
    requireAdmin: (action?: (() => void) | string, fallbackMessage?: string) => {
      if (typeof action === 'string') {
        // Legacy support with admin check
        if (!authContext.isSignedIn || !authContext.isAdmin) {
          authContext.openAuthModal('sign-in', action, 'Administrator access required');
          return false;
        }
        return true;
      } else if (typeof action === 'function') {
        // New modal intercept behavior
        authContext.requireRole('admin', action, fallbackMessage);
        return true;
      } else {
        // Just check admin status
        return authContext.isSignedIn && authContext.isAdmin;
      }
    },
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
