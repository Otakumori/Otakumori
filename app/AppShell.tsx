'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NSFWProvider } from './contexts/NSFWContext';
import AppQueryProvider from './providers/AppQueryProvider';
import Navbar from './components/layout/Navbar';
import { CartProvider } from './components/cart/CartProvider';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith('/commerce-core')) {
    return children;
  }

  return (
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
  );
}
