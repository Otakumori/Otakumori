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

const ACCOUNTS_BASE_URL = 'https://accounts.otaku-mori.com';

export default function ClerkProviderWrapper({ children, nonce }: ClerkProviderWrapperProps) {
  const publishableKey = clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    getLogger()
      .then((logger) => {
        logger.error(' NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
      })
      .catch(() => {
        // Silently fail if logger can't be loaded
      });
    return <div>Authentication configuration error</div>;
  }

  const configuredDomain = clientEnv.NEXT_PUBLIC_CLERK_DOMAIN?.trim();
  const configuredProxyUrl = clientEnv.NEXT_PUBLIC_CLERK_PROXY_URL?.trim();

  const clerkProps: any = {
    publishableKey,
    signInUrl: `${ACCOUNTS_BASE_URL}/sign-in`,
    signUpUrl: `${ACCOUNTS_BASE_URL}/sign-up`,
    afterSignInUrl: '/',
    afterSignUpUrl: '/',
    fallbackRedirectUrl: '/',
    nonce,
  };

  if (configuredDomain) {
    clerkProps.domain = configuredDomain;
  }

  if (configuredProxyUrl) {
    clerkProps.proxyUrl = configuredProxyUrl;
  }

  return <ClerkProvider {...clerkProps}>{children}</ClerkProvider>;
}
