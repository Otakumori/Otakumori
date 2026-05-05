'use client';

import FullClerkProviderWrapper from './FullClerkProviderWrapper';

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
  nonce?: string | undefined;
}

export default function ClerkProviderWrapper({ children, nonce }: ClerkProviderWrapperProps) {
  return <FullClerkProviderWrapper nonce={nonce}>{children}</FullClerkProviderWrapper>;
}
