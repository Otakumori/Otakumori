import FullClerkProviderWrapper from './FullClerkProviderWrapper';

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
  nonce?: string | undefined;
  disableClerk?: boolean;
}

export default function ClerkProviderWrapper({ children, nonce, disableClerk = false }: ClerkProviderWrapperProps) {
  if (disableClerk) {
    return <>{children}</>;
  }

  return (
    <FullClerkProviderWrapper nonce={nonce}>
      {children}
    </FullClerkProviderWrapper>
  );
}
