'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { clientEnv } from '@/env/client';

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
  nonce?: string | undefined;
}

export default function ClerkProviderWrapper({ children, nonce }: ClerkProviderWrapperProps) {
  // Use the environment-specific publishable key from Vercel environment variables
  const publishableKey = clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error(' NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
    return <div>Authentication configuration error</div>;
  }

  // Environment-specific configuration - use the actual env var that's set
  const isProduction = clientEnv.NEXT_PUBLIC_VERCEL_ENVIRONMENT === 'production';
  
  // Check if we're actually on the production domain (not a preview deployment)
  const isProductionDomain =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'otaku-mori.com' || window.location.hostname === 'www.otaku-mori.com');
  
  const _isDevelopment =
    typeof window !== 'undefined'
      ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      : !isProduction;

  // Dynamic props based on environment
  const clerkProps: any = {
    publishableKey,
    // Use fallbackRedirectUrl instead of deprecated afterSignInUrl/afterSignUpUrl
    fallbackRedirectUrl: '/',
    signInUrl: clientEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    signUpUrl: clientEnv.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    nonce,
  };

  // Only set domain if we're actually on the production domain
  // Production keys only work with approved domains, so don't set domain on preview deployments
  if (isProduction && isProductionDomain) {
    clerkProps.domain = 'otaku-mori.com';
  }
  // Development/Preview: use proxy if available, no domain
  else {
    if (clientEnv.NEXT_PUBLIC_CLERK_PROXY_URL) {
      clerkProps.proxyUrl = clientEnv.NEXT_PUBLIC_CLERK_PROXY_URL;
    }
  }

  return <ClerkProvider {...clerkProps}>{children}</ClerkProvider>;
}
