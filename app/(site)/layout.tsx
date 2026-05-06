import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import FullAppShell from '@/app/FullAppShell';
import ClerkProviderWrapper from '@/app/providers/ClerkProviderWrapper';

interface SiteLayoutProps {
  children: ReactNode;
}

export default async function SiteLayout({ children }: SiteLayoutProps) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;

  return (
    <ClerkProviderWrapper nonce={nonce}>
      <FullAppShell>{children}</FullAppShell>
    </ClerkProviderWrapper>
  );
}
