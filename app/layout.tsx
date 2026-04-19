import './globals.css';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import ClerkProviderWrapper from './providers/ClerkProviderWrapper';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;

  return (
    <ClerkProviderWrapper nonce={nonce || undefined}>
      <html lang="en">
        <body>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
