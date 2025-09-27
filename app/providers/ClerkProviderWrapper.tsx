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

  // Environment-specific configuration
  const isProduction = env.NEXT_PUBLIC_VERCEL_ENVIRONMENT === 'production';

  // Dynamic props based on environment
  const clerkProps: any = {
    publishableKey,
    nonce,
    // Basic URL configuration - keep existing sign-in/up URLs
    signInUrl: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
    signUpUrl: env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
    // Use fallbackRedirectUrl instead of deprecated afterSignInUrl/afterSignUpUrl
    fallbackRedirectUrl: '/',
  };

  // Production configuration: use domain, no proxy
  if (isProduction) {
    clerkProps.domain = 'clerk.otaku-mori.com';
  } else {
    // Preview/Local configuration: use proxy, no domain
    if (env.NEXT_PUBLIC_CLERK_PROXY_URL) {
      clerkProps.proxyUrl = env.NEXT_PUBLIC_CLERK_PROXY_URL;
    }
  }

  return <ClerkProvider {...clerkProps}>{children}</ClerkProvider>;
}
