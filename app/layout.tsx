import './globals.css';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import ClerkProviderWrapper from './providers/ClerkProviderWrapper';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NSFWProvider } from './contexts/NSFWContext';
import AppQueryProvider from './providers/AppQueryProvider';
import Navbar from './components/layout/Navbar';
import { CartProvider } from './components/cart/CartProvider';

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;
  const pathname = headersList.get('x-otm-pathname') ?? '';
  const isCommerceCore = pathname.startsWith('/commerce-core');

  return (
    <ClerkProviderWrapper nonce={nonce || undefined}>
      <html lang="en">
        <body>
          {isCommerceCore ? (
            children
          ) : (
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
          )}
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
