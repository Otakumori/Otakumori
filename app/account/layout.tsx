import type { ReactNode } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import ClerkProviderWrapper from '../providers/ClerkProviderWrapper';

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;

  return (
    <ClerkProviderWrapper nonce={nonce}>
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
        {children}
      </div>
    </ClerkProviderWrapper>
  );
}
