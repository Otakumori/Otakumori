'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface AuthModalState {
  isOpen: boolean;
  action: 'sign-in' | 'sign-up' | 'profile' | null;
  redirectUrl?: string;
  message?: string;
}

interface AuthContextType {
  // Modal state
  authModal: AuthModalState;
  openAuthModal: (action: 'sign-in' | 'sign-up', redirectUrl?: string, message?: string) => void;
  closeAuthModal: () => void;

  // Auth state
  isSignedIn: boolean;
  isLoading: boolean;
  user: any;

  // Actions
  requireAuth: (action: () => void, fallbackMessage?: string) => void;
  requireRole: (role: string, action: () => void, fallbackMessage?: string) => void;

  // Navigation
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useAuth();
  const router = useRouter();

  const [authModal, setAuthModal] = useState<AuthModalState>({
    isOpen: false,
    action: null,
  });

  const openAuthModal = useCallback(
    (action: 'sign-in' | 'sign-up', redirectUrl?: string, message?: string) => {
      setAuthModal({
        isOpen: true,
        action,
        redirectUrl,
        message,
      });
    },
    [],
  );

  const closeAuthModal = useCallback(() => {
    setAuthModal({
      isOpen: false,
      action: null,
    });
  }, []);

  const requireAuth = useCallback(
    (action: () => void, fallbackMessage = 'Please sign in to continue') => {
      if (!isSignedIn) {
        openAuthModal('sign-in', undefined, fallbackMessage);
        return;
      }
      action();
    },
    [isSignedIn, openAuthModal],
  );

  const requireRole = useCallback(
    (
      role: string,
      action: () => void,
      fallbackMessage = `This action requires ${role} permissions`,
    ) => {
      if (!isSignedIn) {
        openAuthModal('sign-in', undefined, 'Please sign in to continue');
        return;
      }

      const userRole = (user?.publicMetadata as any)?.role || 'user';
      if (userRole !== role && userRole !== 'admin') {
        // Show error message or redirect to unauthorized page
        openAuthModal('sign-in', undefined, fallbackMessage);
        return;
      }

      action();
    },
    [isSignedIn, user, openAuthModal],
  );

  const signOut = useCallback(async () => {
    try {
      await clerkSignOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [clerkSignOut, router]);

  const value: AuthContextType = {
    authModal,
    openAuthModal,
    closeAuthModal,
    isSignedIn: isSignedIn || false,
    isLoading: !isLoaded,
    user,
    requireAuth,
    requireRole,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal />
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
