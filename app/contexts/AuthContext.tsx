'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { type User } from '@clerk/nextjs/server';
import { useRouter } from 'next/navigation';
import { OnboardingModal } from '@/app/components/onboarding/OnboardingModal';

interface AuthModalState {
  isOpen: boolean;
  action: 'sign-in' | 'sign-up' | 'profile' | null;
  redirectUrl?: string;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  redirectToSignIn: (redirectUrl?: string) => void;
  redirectToSignUp: (redirectUrl?: string) => void;

  // Modal state
  authModal: AuthModalState;
  openAuthModal: (action: 'sign-in' | 'sign-up', redirectUrl?: string, message?: string) => void;
  closeAuthModal: () => void;

  // Onboarding state
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;

  // Actions
  requireAuth: (action: () => void, fallbackMessage?: string) => void;
  requireRole: (role: string, action: () => void, fallbackMessage?: string) => void;

  // Specific gated actions mentioned in v0 spec
  requireAuthForSoapstone: (action: () => void) => void;
  requireAuthForPraise: (action: () => void) => void;
  requireAuthForWishlist: (action: () => void) => void;
  requireAuthForTrade: (action: () => void) => void;
  requireAuthForCommunity: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Safely use Clerk hooks with error handling
  let user: User | null = null;
  let isLoaded = false;
  let signOut: (() => Promise<void>) | undefined;

  try {
    const clerkUser = useUser();
    const clerkAuth = useAuth();
    user = clerkUser.user as User | null;
    isLoaded = clerkUser.isLoaded;
    signOut = clerkAuth.signOut;
  } catch {
    // Clerk is not available, use mock state
    isLoaded = true;
  }

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [authModal, setAuthModal] = useState<AuthModalState>({
    isOpen: false,
    action: null,
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Session-based deduplication to prevent modal spam
  const [shownThisSession, setShownThisSession] = useState<Set<string>>(new Set());

  // Check if user is admin based on metadata
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.unsafeMetadata?.role === 'admin';

  useEffect(() => {
    if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded]);

  // Reset session deduplication when user auth state changes
  useEffect(() => {
    if (isLoaded) {
      setShownThisSession(new Set()); // Clear session deduplication on auth change
    }
  }, [user?.id, isLoaded]); // Reset when user ID changes

  // Check if user should see onboarding on first sign-in
  useEffect(() => {
    if (isLoaded && user && !isLoading) {
      // Check if this is a new user (created in last 5 minutes) or hasn't seen onboarding
      const hasSeenOnboarding = typeof window !== 'undefined' && 
        localStorage.getItem('otm-onboarding-completed') === 'true';
      
      if (!hasSeenOnboarding) {
        // Check if user was created recently (within last 5 minutes)
        const createdAt = user.createdAt ? new Date(user.createdAt).getTime() : 0;
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        
        if (createdAt > fiveMinutesAgo) {
          setShowOnboarding(true);
        }
      }
    }
  }, [isLoaded, user, isLoading]);

  const openAuthModal = useCallback(
    (action: 'sign-in' | 'sign-up', redirectUrl?: string, message?: string) => {
      // Create a unique key for this modal request
      const modalKey = `${action}-${message || 'default'}`;

      // Check if we've already shown this modal in this session
      if (shownThisSession.has(modalKey)) {
        return; // Don't show duplicate modal
      }

      // Mark as shown for this session
      setShownThisSession((prev) => new Set(prev).add(modalKey));

      setAuthModal({
        isOpen: true,
        action,
        redirectUrl,
        message,
      });
    },
    [shownThisSession],
  );

  const closeAuthModal = useCallback(() => {
    setAuthModal({
      isOpen: false,
      action: null,
    });
  }, []);

  const requireAuth = useCallback(
    (action: () => void, fallbackMessage = 'Please sign in to continue') => {
      if (!user) {
        openAuthModal('sign-in', undefined, fallbackMessage);
        return;
      }
      action();
    },
    [user, openAuthModal],
  );

  const requireRole = useCallback(
    (
      role: string,
      action: () => void,
      fallbackMessage = `This action requires ${role} permissions`,
    ) => {
      if (!user) {
        openAuthModal('sign-in', undefined, 'Please sign in to continue');
        return;
      }

      const userRole = (user.publicMetadata as any)?.role || 'user';
      if (userRole !== role && userRole !== 'admin') {
        openAuthModal('sign-in', undefined, fallbackMessage);
        return;
      }

      action();
    },
    [user, openAuthModal],
  );

  const redirectToSignIn = (redirectUrl?: string) => {
    const url = new URL('/sign-in', window.location.origin);
    if (redirectUrl) {
      url.searchParams.set('redirect_url', redirectUrl);
    }
    // Use Next.js router for client-side navigation
    router.push(url.pathname + url.search);
  };

  const redirectToSignUp = (redirectUrl?: string) => {
    const url = new URL('/sign-up', window.location.origin);
    if (redirectUrl) {
      url.searchParams.set('redirect_url', redirectUrl);
    }
    // Use Next.js router for client-side navigation
    router.push(url.pathname + url.search);
  };

  // Specific gated action implementations
  const requireAuthForSoapstone = useCallback(
    (action: () => void) => {
      if (!user) {
        openAuthModal('sign-in', undefined, 'Sign in to leave a sign for fellow travelers');
        return;
      }
      action();
    },
    [user, openAuthModal],
  );

  const requireAuthForPraise = useCallback(
    (action: () => void) => {
      if (!user) {
        openAuthModal('sign-in', undefined, 'Sign in to send praise to other travelers');
        return;
      }
      action();
    },
    [user, openAuthModal],
  );

  const requireAuthForWishlist = useCallback(
    (action: () => void) => {
      if (!user) {
        openAuthModal('sign-in', undefined, 'Sign in to add items to your wishlist');
        return;
      }
      action();
    },
    [user, openAuthModal],
  );

  const requireAuthForTrade = useCallback(
    (action: () => void) => {
      if (!user) {
        openAuthModal('sign-in', undefined, 'Sign in to present offers in the Scarlet Bazaar');
        return;
      }
      action();
    },
    [user, openAuthModal],
  );

  const requireAuthForCommunity = useCallback(
    (action: () => void) => {
      if (!user) {
        openAuthModal('sign-in', undefined, 'Sign in to participate in community discussions');
        return;
      }
      action();
    },
    [user, openAuthModal],
  );

  const value: AuthContextType = {
    user: user as User | null,
    isLoaded,
    isSignedIn: !!user,
    isAdmin,
    isLoading,
    signOut: signOut || (() => Promise.resolve()),
    redirectToSignIn,
    redirectToSignUp,
    authModal,
    openAuthModal,
    closeAuthModal,
    showOnboarding,
    setShowOnboarding,
    requireAuth,
    requireRole,
    requireAuthForSoapstone,
    requireAuthForPraise,
    requireAuthForWishlist,
    requireAuthForTrade,
    requireAuthForCommunity,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal />
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </AuthContext.Provider>
  );
}

// Auth Modal Component
function AuthModal() {
  const { authModal, closeAuthModal } = useAuthContext();
  const { isOpen, action, redirectUrl, message } = authModal;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          {/* Modal content */}
          <div className="text-center">
            <h2 className="text-2xl font-display text-white mb-4">
              {action === 'sign-in' ? 'Sign In Required' : 'Create Account'}
            </h2>

            {message && <p className="text-zinc-300 mb-6">{message}</p>}

            <div className="space-y-4">
              <a
                href={`/sign-in${redirectUrl ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : ''}`}
                className="block w-full bg-pink-600 hover:bg-pink-700 text-white font-ui py-3 px-6 rounded-xl transition-colors"
              >
                {action === 'sign-in' ? 'Sign In' : 'Sign Up'}
              </a>

              <button
                onClick={closeAuthModal}
                className="block w-full bg-white/10 hover:bg-white/20 text-white font-ui py-3 px-6 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
