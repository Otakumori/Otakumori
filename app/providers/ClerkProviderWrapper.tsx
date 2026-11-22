'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { resolveClerkRouting } from '@/app/lib/auth/accountUrls';
import { isVisualQaAuthEnabled } from '@/app/lib/visual-qa/mode';

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
function normalizeHost(host: string | undefined) {
  return host?.split(':')[0]?.trim().toLowerCase();
}

function appOriginForHost(host: string | undefined) {
  const normalizedHost = normalizeHost(host);
  if (!normalizedHost) return undefined;
  const isLocal = normalizedHost === 'localhost' || normalizedHost === '127.0.0.1';
  return `${isLocal ? 'http' : 'https'}://${host}`;
}

export default function ClerkProviderWrapper({
  children,
  nonce,
  requestHost,
}: ClerkProviderWrapperProps) {
  if (isVisualQaAuthEnabled()) {
    return <>{children}</>;
  }

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

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

  const configuredDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN?.trim();
  const configuredProxyUrl = process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim();
  const routing = resolveClerkRouting(appOriginForHost(requestHost), publishableKey);
  if (routing.mode === 'blocked') {
    return <div role="alert">Authentication configuration error</div>;
  }

  const useProductionClerkOrigin = routing.mode === 'production-hosted';
  const clerkProps: any = {
    publishableKey,
    signInUrl: useProductionClerkOrigin ? `${ACCOUNTS_BASE_URL}/sign-in` : '/sign-in',
    signUpUrl: useProductionClerkOrigin ? `${ACCOUNTS_BASE_URL}/sign-up` : '/sign-up',
    fallbackRedirectUrl: '/',
    nonce,
  };

  if (useProductionClerkOrigin && configuredDomain) {
    clerkProps.domain = configuredDomain;
  }

  if (useProductionClerkOrigin && configuredProxyUrl) {
    clerkProps.proxyUrl = configuredProxyUrl;
  }

  return <ClerkProvider {...clerkProps}>{children}</ClerkProvider>;
}
