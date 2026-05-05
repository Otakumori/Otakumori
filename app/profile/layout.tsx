import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import ClerkProviderWrapper from '../providers/ClerkProviderWrapper';
import FullAppShell from '../FullAppShell';

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;

  return (
    <ClerkProviderWrapper nonce={nonce}>
      <FullAppShell>{children}</FullAppShell>
    </ClerkProviderWrapper>
  );
}
