'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { env } from '@/env.mjs';

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
  nonce?: string;
}

export default function ClerkProviderWrapper({ children, nonce }: ClerkProviderWrapperProps) {
  // Check if we're on the actual production domain, not a preview URL
  const isActualProduction =
    typeof window !== 'undefined' && window.location.hostname === 'otaku-mori.com';

  // Use development keys for localhost, production keys for production
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Check for Vercel preview domains
  const isVercelPreview =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('.vercel.app') ||
      (window.location.hostname.includes('otaku-mori') &&
        !window.location.hostname.includes('.com')));

  // Determine which publishable key to use
  let publishableKey = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // For non-production environments, use development key if available
  if (!isActualProduction) {
    // Check if we have a development key configured
    const devKey =
      env.NEXT_PUBLIC_CLERK_DEV_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_CLERK_DEV_PUBLISHABLE_KEY;

    if (devKey) {
      publishableKey = devKey;
      console.log('🔧 Using Clerk development keys for preview environment');
    } else if (publishableKey?.startsWith('pk_live_')) {
      // If we only have production keys and we're not in production, warn but continue
      console.warn(
        '⚠️ Using production Clerk keys on non-production domain. Consider setting up development keys.',
      );
    }
  }

  // Always provide a ClerkProvider to prevent hook errors
  if (!publishableKey || publishableKey === 'pk_test_mock') {
    console.warn('⚠️ No valid Clerk keys found. Using disabled Clerk provider.');
  }

  const clerkProps: any = {
    dynamic: true,
    nonce,
    publishableKey: publishableKey,
  };

  // Basic Clerk configuration
  if (env.NEXT_PUBLIC_CLERK_SIGN_IN_URL) clerkProps.signInUrl = env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
  if (env.NEXT_PUBLIC_CLERK_SIGN_UP_URL) clerkProps.signUpUrl = env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;
  if (env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL)
    clerkProps.afterSignInUrl = env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL;
  if (env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL)
    clerkProps.afterSignUpUrl = env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL;

  // Only set domain and proxy URL on the actual production domain
  if (isActualProduction) {
    if (env.NEXT_PUBLIC_CLERK_DOMAIN) {
      clerkProps.domain = env.NEXT_PUBLIC_CLERK_DOMAIN;
    }
    if (env.NEXT_PUBLIC_CLERK_PROXY_URL) {
      clerkProps.proxyUrl = env.NEXT_PUBLIC_CLERK_PROXY_URL;
    }
  } else {
    // For localhost and preview URLs, force Clerk to use the default CDN
    clerkProps.domain = undefined;
    clerkProps.proxyUrl = undefined;
    clerkProps.frontendApi = undefined;
    // Allow Clerk to operate in development mode
    clerkProps.allowedRedirectOrigins = ['*'];
  }

  if (typeof env.NEXT_PUBLIC_CLERK_IS_SATELLITE !== 'undefined') {
    clerkProps.isSatellite = env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true';
  }

  return <ClerkProvider {...clerkProps}>{children}</ClerkProvider>;
}
