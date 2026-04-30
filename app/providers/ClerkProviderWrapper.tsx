'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const FullClerkProviderWrapper = dynamic(() => import('./FullClerkProviderWrapper'));

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
  nonce?: string | undefined;
}

export default function ClerkProviderWrapper({ children, nonce }: ClerkProviderWrapperProps) {
  const pathname = usePathname();

  if (pathname?.startsWith('/commerce-core')) {
    return children;
  }

  return <FullClerkProviderWrapper nonce={nonce}>{children}</FullClerkProviderWrapper>;
}
