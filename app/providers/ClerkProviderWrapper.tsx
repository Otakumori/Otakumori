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
  const publishableKey = clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    getLogger().then((logger) => {
      logger.error(' NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
    }).catch(() => {
      // Silently fail if logger can't be loaded
    });
    return <div>Authentication configuration error</div>;
  }

  const isProduction = clientEnv.NEXT_PUBLIC_VERCEL_ENVIRONMENT === 'production';

  const clerkProps: any = {
    publishableKey,
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
    afterSignInUrl: '/',
    afterSignUpUrl: '/',
    fallbackRedirectUrl: '/',
    nonce,
  };

  const configuredDomain = clientEnv.NEXT_PUBLIC_CLERK_DOMAIN?.trim();
  const configuredProxyUrl = clientEnv.NEXT_PUBLIC_CLERK_PROXY_URL?.trim();

  if (isProduction) {
    if (configuredDomain) {
      clerkProps.domain = configuredDomain;
    }
  } else if (configuredProxyUrl) {
    clerkProps.proxyUrl = configuredProxyUrl;
  }

  return <ClerkProvider {...clerkProps}>{children}</ClerkProvider>;
}
