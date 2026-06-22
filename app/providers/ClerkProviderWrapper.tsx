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
  requestHost?: string | undefined;
}

const ACCOUNTS_BASE_URL = 'https://accounts.otaku-mori.com';
const PRODUCTION_HOSTS = new Set(['otaku-mori.com', 'www.otaku-mori.com', 'accounts.otaku-mori.com']);

function normalizeHost(host: string | undefined) {
  return host?.split(':')[0]?.trim().toLowerCase();
}

function isProductionClerkHost(host: string | undefined) {
  const normalizedHost = normalizeHost(host);
  return Boolean(normalizedHost && PRODUCTION_HOSTS.has(normalizedHost));
}

function disabledClerkOrigin() {
  return undefined;
}

export default function ClerkProviderWrapper({
  children,
  nonce,
  requestHost,
}: ClerkProviderWrapperProps) {
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
  const useProductionClerkOrigin = isProductionClerkHost(requestHost);
  const clerkProps: any = {
    publishableKey,
    signInUrl: `${ACCOUNTS_BASE_URL}/sign-in`,
    signUpUrl: `${ACCOUNTS_BASE_URL}/sign-up`,
    fallbackRedirectUrl: '/',
    nonce,
  };

  if (configuredDomain) {
    clerkProps.domain = useProductionClerkOrigin ? configuredDomain : disabledClerkOrigin;
  }

  if (configuredProxyUrl) {
    clerkProps.proxyUrl = useProductionClerkOrigin ? configuredProxyUrl : disabledClerkOrigin;
  }

  return <ClerkProvider {...clerkProps}>{children}</ClerkProvider>;
}
