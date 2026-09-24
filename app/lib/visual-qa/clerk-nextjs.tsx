'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { resolveVisualQaAuthState, type VisualQaAuthState } from './mode';

type VisualQaUser = {
  id: string;
  username: string;
  fullName: string;
  firstName: string;
  imageUrl: string;
  createdAt: Date;
  primaryEmailAddress: { emailAddress: string };
  emailAddresses: Array<{ emailAddress: string }>;
  publicMetadata: Record<string, unknown>;
  unsafeMetadata: Record<string, unknown>;
};

const visualQaUser: VisualQaUser = {
  id: 'visual_qa_owner',
  username: 'visual-owner',
  fullName: 'Visual QA Owner',
  firstName: 'Visual',
  imageUrl: '',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  primaryEmailAddress: { emailAddress: 'visual-owner@example.invalid' },
  emailAddresses: [{ emailAddress: 'visual-owner@example.invalid' }],
  publicMetadata: { role: 'admin', username: 'visual-owner' },
  unsafeMetadata: {},
};

const VisualQaAuthStateContext = createContext<VisualQaAuthState | null>(null);

export function VisualQaAuthProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: VisualQaAuthState;
}) {
  return (
    <VisualQaAuthStateContext.Provider value={initialState}>
      {children}
    </VisualQaAuthStateContext.Provider>
  );
}

function useVisualQaAuthState() {
  return useContext(VisualQaAuthStateContext) ?? resolveVisualQaAuthState();
}

function useIsSignedIn() {
  return useVisualQaAuthState() === 'signed-in';
}

export function ClerkProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useUser() {
  const signedIn = useIsSignedIn();

  return {
    isLoaded: true,
    isSignedIn: signedIn,
    user: signedIn ? visualQaUser : null,
  };
}

export function useAuth() {
  const signedIn = useIsSignedIn();

  return {
    isLoaded: true,
    isSignedIn: signedIn,
    userId: signedIn ? visualQaUser.id : null,
    sessionId: signedIn ? 'visual_qa_session' : null,
    getToken: async () => null,
    signOut: async ({ redirectUrl }: { redirectUrl?: string } = {}) => {
      if (typeof window !== 'undefined' && redirectUrl) {
        window.location.assign(redirectUrl);
      }
    },
  };
}

export const usePromisifiedAuth = useAuth;

export function SignedIn({ children }: { children: ReactNode }) {
  return useIsSignedIn() ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: ReactNode }) {
  return useIsSignedIn() ? null : <>{children}</>;
}

export function UserButton() {
  return <span aria-label="Visual QA user menu" data-testid="visual-qa-user-button" />;
}

export function SignInButton({ children }: { children?: ReactNode }) {
  return <>{children ?? <button type="button">Sign in</button>}</>;
}

export function SignIn() {
  return <div data-testid="visual-qa-sign-in">Visual QA sign-in placeholder</div>;
}

export function SignUp() {
  return <div data-testid="visual-qa-sign-up">Visual QA sign-up placeholder</div>;
}
