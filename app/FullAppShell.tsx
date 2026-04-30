'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NSFWProvider } from './contexts/NSFWContext';
import AppQueryProvider from './providers/AppQueryProvider';
import Navbar from './components/layout/Navbar';
import { CartProvider } from './components/cart/CartProvider';

export default function FullAppShell({ children }: { children: ReactNode }) {
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
