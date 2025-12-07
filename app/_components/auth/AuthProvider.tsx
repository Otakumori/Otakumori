/**
 * Authentication Provider - Complete Implementation
 *
 * Features:
 * - Modal intercept for gated actions
 * - Context-aware authentication
 * - SSR-safe implementation
 * - Auto-redirect handling
 * - Custom hooks for auth states
 */

'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import AuthModal from './AuthModal';

interface AuthContext {
  // Modal state
  isModalOpen: boolean;
  showAuthModal: (context?: AuthModalContext) => void;
  hideAuthModal: () => void;

  // Gated action helpers
  requireAuthForSoapstone: () => Promise<boolean>;
  requireAuthForPraise: () => Promise<boolean>;
  requireAuthForWishlist: () => Promise<boolean>;
  requireAuthForTrade: () => Promise<boolean>;
  requireAuthForCommunity: () => Promise<boolean>;
  requireAuthForGeneric: (context: AuthModalContext) => Promise<boolean>;

  // Auth state (from Clerk)
  isSignedIn: boolean;
  isLoading: boolean;
  userId: string | null;
}

interface AuthModalContext {
  action: string;
  description: string;
  iconType: 'soapstone' | 'praise' | 'wishlist' | 'trade' | 'community';
  benefits?: string[];
  redirectUrl?: string;
  mode?: 'signin' | 'signup';

const AuthContext = createContext<AuthContext | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isSignedIn, isLoaded, userId } = useClerkAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<AuthModalContext | undefined>();
  const [authPromiseResolve, setAuthPromiseResolve] = useState<((success: boolean) => void) | null>(
    null,
  );

  // Show auth modal with context
  const showAuthModal = useCallback((context?: AuthModalContext) => {
    setModalContext(context);
    setIsModalOpen(true);
  }, []);

  // Hide auth modal
  const hideAuthModal = useCallback(() => {
    setIsModalOpen(false);
    setModalContext(undefined);

    // Resolve any pending auth promise
    if (authPromiseResolve) {
      authPromiseResolve(false);
      setAuthPromiseResolve(null);
    }
  }, [authPromiseResolve]);

  // Handle auth success
  const handleAuthSuccess = useCallback(() => {
    setIsModalOpen(false);
    setModalContext(undefined);

    // Resolve auth promise with success
    if (authPromiseResolve) {
      authPromiseResolve(true);
      setAuthPromiseResolve(null);
    }
  }, [authPromiseResolve]);

  // Generic auth requirement function
  const requireAuth = useCallback(
    (context: AuthModalContext): Promise<boolean> => {
      // If already signed in, resolve immediately
      if (isSignedIn) {
        return Promise.resolve(true);
      }

      // If loading, wait for auth state
      if (!isLoaded) {
        return Promise.resolve(false);
      }

      // Show modal and return promise
      return new Promise<boolean>((resolve) => {
        setAuthPromiseResolve(() => resolve);
        showAuthModal(context);
      });
    },
    [isSignedIn, isLoaded, showAuthModal],
  );

  // Specific gated action functions
  const requireAuthForSoapstone = useCallback(() => {
    return requireAuth({
      action: 'Sign in to leave a sign for fellow travelers',
      description: 'Share your wisdom and messages with the community',
      iconType: 'soapstone',
      benefits: [
        'Leave meaningful messages',
        'Build your reputation',
        'Connect with travelers',
        'Share discoveries',
      ],
    });
  }, [requireAuth]);

  const requireAuthForPraise = useCallback(() => {
    return requireAuth({
      action: 'Sign in to send praise to other travelers',
      description: 'Spread positivity and recognition in the community',
      iconType: 'praise',
      benefits: [
        'Appreciate great content',
        'Build community bonds',
        'Earn karma points',
        'Unlock praise badges',
      ],
    });
  }, [requireAuth]);

  const requireAuthForWishlist = useCallback(() => {
    return requireAuth({
      action: 'Sign in to add items to your wishlist',
      description: 'Curate your perfect collection of anime treasures',
      iconType: 'wishlist',
      benefits: [
        'Save favorite items',
        'Track price changes',
        'Get restock alerts',
        'Share collections',
      ],
    });
  }, [requireAuth]);

  const requireAuthForTrade = useCallback(() => {
    return requireAuth({
      action: 'Sign in to present offers in the Scarlet Bazaar',
      description: 'Join the bustling marketplace of rare finds',
      iconType: 'trade',
      benefits: [
        'Trade rare items',
        'Build trust reputation',
        'Access exclusive deals',
        'Connect with collectors',
      ],
    });
  }, [requireAuth]);

  const requireAuthForCommunity = useCallback(() => {
    return requireAuth({
      action: 'Sign in to participate in community discussions',
      description: 'Join conversations with fellow otaku',
      iconType: 'community',
      benefits: [
        'Join discussions',
        'Share your thoughts',
        'Get recommendations',
        'Build friendships',
      ],
    });
  }, [requireAuth]);

  const requireAuthForGeneric = useCallback(
    (context: AuthModalContext) => {
      return requireAuth(context);
    },
    [requireAuth],
  );

  const contextValue: AuthContext = {
    // Modal state
    isModalOpen,
    showAuthModal,
    hideAuthModal,

    // Gated action helpers
    requireAuthForSoapstone,
    requireAuthForPraise,
    requireAuthForWishlist,
    requireAuthForTrade,
    requireAuthForCommunity,
    requireAuthForGeneric,

    // Auth state
    isSignedIn: isSignedIn || false,
    isLoading: !isLoaded,
    userId: userId || null,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={hideAuthModal}
        context={modalContext}
        onSuccess={handleAuthSuccess}
      />
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

// Convenience hooks for specific actions
export function useRequireAuth() {
  const {
    requireAuthForSoapstone,
    requireAuthForPraise,
    requireAuthForWishlist,
    requireAuthForTrade,
    requireAuthForCommunity,
    requireAuthForGeneric,
  } = useAuthContext();

  return {
    requireAuthForSoapstone,
    requireAuthForPraise,
    requireAuthForWishlist,
    requireAuthForTrade,
    requireAuthForCommunity,
    requireAuthForGeneric,
  };
}

// Hook for protected actions
export function useProtectedAction() {
  const { isSignedIn, isLoading } = useAuthContext();
  const requireAuth = useRequireAuth();

  const withAuth = useCallback(
    async <T extends any[]>(
      action: (...args: T) => void | Promise<void>,
      authType: keyof ReturnType<typeof useRequireAuth>,
    ) => {
      return async (...args: T) => {
        if (isLoading) return;

        const authRequired = requireAuth[authType];
        let hasAuth = false;

        if (authType === 'requireAuthForGeneric') {
          // For generic auth, use a default context
          hasAuth = await (authRequired as typeof requireAuth.requireAuthForGeneric)({
            action: 'Sign in to continue',
            description: 'Authentication required for this action',
            iconType: 'community',
          });
        } else {
          hasAuth = await (authRequired as () => Promise<boolean>)();
        }

        if (hasAuth) {
          return action(...args);
        }
      };
    },
    [isSignedIn, isLoading, requireAuth],
  );

  return { withAuth, isSignedIn, isLoading };
}

// Higher-order component for protected routes
export function withAuthRequired<P extends object>(
  Component: React.ComponentType<P>,
  authContext?: AuthModalContext,
) {
  return function ProtectedComponent(props: P) {
    const { isSignedIn, isLoading, requireAuthForGeneric } = useAuthContext();

    // Show loading state
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      );
    }

    // Require auth if not signed in
    if (!isSignedIn) {
      const handleAuthRequired = () => {
        requireAuthForGeneric(
          authContext || {
            action: 'Sign in to access this page',
            description: 'This page requires authentication to continue',
            iconType: 'community',
          },
        );
      };

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
            <p className="text-slate-300 mb-6">You need to sign in to access this page.</p>
            <button
              onClick={handleAuthRequired}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-400 hover:to-purple-500 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

export default AuthProvider;
