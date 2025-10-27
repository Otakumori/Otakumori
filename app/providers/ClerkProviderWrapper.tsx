'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { env } from '@/server/env';

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
  nonce?: string | undefined;
}

export default function ClerkProviderWrapper({ children, nonce }: ClerkProviderWrapperProps) {
  const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

  const clerkProps: any = {
    dynamic: true,
    nonce,
    publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  };

  // Basic Clerk configuration
  if (env.NEXT_PUBLIC_CLERK_SIGN_IN_URL) clerkProps.signInUrl = env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
  if (env.NEXT_PUBLIC_CLERK_SIGN_UP_URL) clerkProps.signUpUrl = env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;
  if (env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL)
    clerkProps.afterSignInUrl = env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL;
  if (env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL)
    clerkProps.afterSignUpUrl = env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL;

  // Only set domain and proxy URL in production, not in development
  if (isProduction) {
    if (env.NEXT_PUBLIC_CLERK_DOMAIN) {
      clerkProps.domain = env.NEXT_PUBLIC_CLERK_DOMAIN;
    }
    if (env.NEXT_PUBLIC_CLERK_PROXY_URL) {
      clerkProps.proxyUrl = env.NEXT_PUBLIC_CLERK_PROXY_URL;
    }
  } else {
    // For localhost, force Clerk to use the default CDN instead of custom domain
    clerkProps.domain = undefined;
    clerkProps.proxyUrl = undefined;
    // Force Clerk to use the standard CDN
    clerkProps.frontendApi = undefined;
  }

  if (typeof env.NEXT_PUBLIC_CLERK_IS_SATELLITE !== 'undefined') {
    clerkProps.isSatellite = env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true';
  }

  return <ClerkProvider {...clerkProps}>{children}</ClerkProvider>;
}
