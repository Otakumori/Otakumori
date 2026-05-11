'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { clientEnv } from '@/env/client';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

interface FullClerkProviderWrapperProps {
  children: React.ReactNode;
  nonce?: string | undefined;
  disableClerk?: boolean;
}

const ACCOUNTS_BASE_URL = 'https://accounts.otaku-mori.com';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function isLocalBrowserOrigin() {
  return typeof window !== 'undefined' && LOCAL_HOSTS.has(window.location.hostname);
}

export default function FullClerkProviderWrapper({ children, nonce, disableClerk = false }: FullClerkProviderWrapperProps) {
  const publishableKey = clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isLocalOrigin = isLocalBrowserOrigin();
  const useProductionClerkRouting = clientEnv.NODE_ENV === 'production' && !isLocalOrigin;
  const bypassClerkForLocalProxy = clientEnv.NODE_ENV !== 'production' && Boolean(clientEnv.NEXT_PUBLIC_CLERK_PROXY_URL);

  if (disableClerk) {
    return <>{children}</>;
  }

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

  if (bypassClerkForLocalProxy) {
    return <>{children}</>;
  }

  const configuredDomain = clientEnv.NEXT_PUBLIC_CLERK_DOMAIN?.trim();
  const configuredProxyUrl = clientEnv.NEXT_PUBLIC_CLERK_PROXY_URL?.trim();

  const clerkProps: any = {
    publishableKey,
    signInUrl: useProductionClerkRouting ? `${ACCOUNTS_BASE_URL}/sign-in` : '/sign-in',
    signUpUrl: useProductionClerkRouting ? `${ACCOUNTS_BASE_URL}/sign-up` : '/sign-up',
    fallbackRedirectUrl: '/',
    nonce,
  };

  if (configuredDomain && useProductionClerkRouting) {
    clerkProps.domain = configuredDomain;
  }

  if (configuredProxyUrl && useProductionClerkRouting) {
    clerkProps.proxyUrl = configuredProxyUrl;
  }

  return <ClerkProvider {...clerkProps}>{children}</ClerkProvider>;
}
