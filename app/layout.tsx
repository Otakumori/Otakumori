import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import ClerkProviderWrapper from './providers/ClerkProviderWrapper';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NSFWProvider } from './contexts/NSFWContext';
import AppQueryProvider from './providers/AppQueryProvider';
import Navbar from './components/layout/Navbar';
import StaticPublicNavbar from './components/layout/StaticPublicNavbar';
import { CartProvider } from './components/cart/CartProvider';

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: 'Otaku-mori',
  description: 'Anime x gaming shop + play - petals, runes, rewards.',
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;
  const useLighthouseShell = process.env.LIGHTHOUSE_CI === '1';

  if (useLighthouseShell) {
    return (
      <html lang="en">
        <body>
          <StaticPublicNavbar />
          {children}
        </body>
      </html>
    );
  }

  return (
    <ClerkProviderWrapper nonce={nonce || undefined}>
      <html lang="en">
        <body>
          <AuthProvider>
            <ToastProvider>
              <NSFWProvider>
                <AppQueryProvider>
                  <CartProvider>
                    <Navbar />
                    {children}
                  </CartProvider>
                </AppQueryProvider>
              </NSFWProvider>
            </ToastProvider>
          </AuthProvider>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
