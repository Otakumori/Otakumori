import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import ClerkProviderWrapper from '../providers/ClerkProviderWrapper';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;

  return <ClerkProviderWrapper nonce={nonce}>{children}</ClerkProviderWrapper>;
}
