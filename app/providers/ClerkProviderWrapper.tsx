'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { env } from '@/env.mjs';

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
  nonce?: string;
}

export default function ClerkProviderWrapper({ children, nonce }: ClerkProviderWrapperProps) {
  // Use the environment-specific publishable key from Vercel environment variables
  const publishableKey = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
    return <div>Authentication configuration error</div>;
  }

  // Simple props object - let Vercel environment variables handle the complexity
  const clerkProps = {
    publishableKey,
    nonce,
    // Basic URL configuration
    signInUrl: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
    signUpUrl: env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
    afterSignInUrl: env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/',
    afterSignUpUrl: env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/',
  };

  return <ClerkProvider {...clerkProps}>{children}</ClerkProvider>;
}
