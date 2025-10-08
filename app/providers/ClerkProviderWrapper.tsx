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
    console.error(' NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
    return <div>Authentication configuration error</div>;
  }

  // Environment-specific configuration - use the actual env var that's set
  const isProduction = env.NEXT_PUBLIC_VERCEL_ENVIRONMENT === 'production';
  const _isDevelopment =
    typeof window !== 'undefined'
      ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      : !isProduction;

  // Dynamic props based on environment
  const clerkProps: any = {
    publishableKey,
    // Use fallbackRedirectUrl instead of deprecated afterSignInUrl/afterSignUpUrl
    fallbackRedirectUrl: '/',
    signInUrl: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    signUpUrl: env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    nonce,
  };

  // Production: use main domain (not subdomain), no proxy
  if (isProduction) {
    clerkProps.domain = 'otaku-mori.com';
  }
  // Development/Preview: use proxy, no domain
  else {
    if (env.NEXT_PUBLIC_CLERK_PROXY_URL) {
      clerkProps.proxyUrl = env.NEXT_PUBLIC_CLERK_PROXY_URL;
    }
  }

  return <ClerkProvider {...clerkProps}>{children}</ClerkProvider>;
}
