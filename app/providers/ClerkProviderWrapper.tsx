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
const CLERK_JS_CDN_URL = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js';

function isPreviewHost(): boolean {
  if (typeof window === 'undefined') return false;

  const host = window.location.hostname;

  return host.endsWith('.vercel.app') || host.includes('-git-');
}

function isProductionHost(): boolean {
  if (typeof window === 'undefined') return false;

  const host = window.location.hostname;

  return host === 'otaku-mori.com' || host === 'www.otaku-mori.com' || host === 'accounts.otaku-mori.com';
}

export default function ClerkProviderWrapper({ children, nonce }: ClerkProviderWrapperProps) {
  const publishableKey = clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    getLogger()
      .then((logger) => {
        logger.error('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
      })
      .catch(() => {
        // Silently fail if logger can't be loaded
      });
    return <div>Authentication configuration error</div>;
  }

  const configuredDomain = clientEnv.NEXT_PUBLIC_CLERK_DOMAIN?.trim();
  const configuredProxyUrl = clientEnv.NEXT_PUBLIC_CLERK_PROXY_URL?.trim();
  const isPreview = isPreviewHost();
  const shouldUseProductionClerkRouting = isProductionHost() && !isPreview;
  const shouldUsePreviewClerkJs = isPreview && publishableKey.startsWith('pk_live_');

  const clerkProps: any = {
    publishableKey,
    fallbackRedirectUrl: '/',
    nonce,
  };

  if (shouldUsePreviewClerkJs) {
    clerkProps.clerkJSUrl = CLERK_JS_CDN_URL;
  }

  if (shouldUseProductionClerkRouting) {
    clerkProps.signInUrl = `${ACCOUNTS_BASE_URL}/sign-in`;
    clerkProps.signUpUrl = `${ACCOUNTS_BASE_URL}/sign-up`;

    if (configuredDomain) {
      clerkProps.domain = configuredDomain;
    }

    if (configuredProxyUrl) {
      clerkProps.proxyUrl = configuredProxyUrl;
    }
  }

  return <ClerkProvider {...clerkProps}>{children}</ClerkProvider>;
}
