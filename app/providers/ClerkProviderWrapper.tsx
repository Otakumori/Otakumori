'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { clientEnv } from '@/env/client';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
  nonce?: string | undefined;
}

export default function ClerkProviderWrapper({ children, nonce }: ClerkProviderWrapperProps) {
  // Use the environment-specific publishable key from Vercel environment variables
  const publishableKey = clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    // Log error asynchronously (non-blocking)
    getLogger().then((logger) => {
      logger.error(' NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
    }).catch(() => {
      // Silently fail if logger can't be loaded
    });
    return <div>Authentication configuration error</div>;
  }

  // Environment-specific configuration - use the actual env var that's set
  const isProduction = clientEnv.NEXT_PUBLIC_VERCEL_ENVIRONMENT === 'production';
  const _isDevelopment =
    typeof window !== 'undefined'
      ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      : !isProduction;

  // Dynamic props based on environment
  const clerkProps: any = {
    publishableKey,
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
    afterSignInUrl: '/',
    afterSignUpUrl: '/',
    fallbackRedirectUrl: '/',
    nonce,
  };

  // Production: use main domain (not subdomain), no proxy
  if (isProduction) {
    clerkProps.domain = 'otaku-mori.com';
  }
  // Development/Preview: use proxy, no domain
  else {
    if (clientEnv.NEXT_PUBLIC_CLERK_PROXY_URL) {
      clerkProps.proxyUrl = clientEnv.NEXT_PUBLIC_CLERK_PROXY_URL;
    }
  }

  return <ClerkProvider {...clerkProps}>{children}</ClerkProvider>;
}
