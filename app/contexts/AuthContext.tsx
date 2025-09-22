'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { type User } from '@clerk/nextjs/server';

interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  redirectToSignIn: (redirectUrl?: string) => void;
  redirectToSignUp: (redirectUrl?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin based on metadata
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.unsafeMetadata?.role === 'admin';

  useEffect(() => {
    if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded]);

  const redirectToSignIn = (redirectUrl?: string) => {
    const url = new URL('/sign-in', window.location.origin);
    if (redirectUrl) {
      url.searchParams.set('redirect_url', redirectUrl);
    }
    window.location.href = url.toString();
  };

  const redirectToSignUp = (redirectUrl?: string) => {
    const url = new URL('/sign-up', window.location.origin);
    if (redirectUrl) {
      url.searchParams.set('redirect_url', redirectUrl);
    }
    window.location.href = url.toString();
  };

  const value: AuthContextType = {
    user: user as User | null,
    isLoaded,
    isSignedIn: !!user,
    isAdmin,
    isLoading,
    signOut: signOut || (() => Promise.resolve()),
    redirectToSignIn,
    redirectToSignUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
