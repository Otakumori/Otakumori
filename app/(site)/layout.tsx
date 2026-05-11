import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import FullAppShell from '@/app/FullAppShell';
import ClerkProviderWrapper from '@/app/providers/ClerkProviderWrapper';
import { env } from '@/env.mjs';

interface SiteLayoutProps {
  children: ReactNode;
}

export default async function SiteLayout({ children }: SiteLayoutProps) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;
  const host = headersList.get('host')?.split(':')[0] ?? '';
  const disableClerkForLocalPublicRender =
    env.NODE_ENV !== 'production' &&
    (host === 'localhost' || host === '127.0.0.1' || host === '::1');

  return (
    <ClerkProviderWrapper nonce={nonce} disableClerk={disableClerkForLocalPublicRender}>
      <FullAppShell useAuthProviders={!disableClerkForLocalPublicRender}>{children}</FullAppShell>
    </ClerkProviderWrapper>
  );
}
