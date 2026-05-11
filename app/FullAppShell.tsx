'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NSFWProvider } from './contexts/NSFWContext';
import AppQueryProvider from './providers/AppQueryProvider';
import Navbar from './components/layout/Navbar';
import { CartProvider, useCart } from './components/cart/CartProvider';
import { paths } from '@/lib/paths';

function LocalPublicNavbar() {
  const { itemCount } = useCart();

  return (
    <header className="relative z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-sm text-white sm:px-6 lg:px-8">
        <Link href={paths.home()} className="font-display text-lg tracking-[0.18em] text-pink-100">
          OTAKU-MORI
        </Link>
        <div className="flex items-center gap-4">
          <Link href={paths.shop()} className="text-white/75 transition hover:text-white">
            Shop
          </Link>
          <Link href={paths.games()} className="text-white/75 transition hover:text-white">
            Play
          </Link>
          <Link href={paths.community()} className="text-white/75 transition hover:text-white">
            Community
          </Link>
          <Link
            href={paths.cart()}
            className="rounded-full border border-pink-200/25 px-3 py-2 text-pink-50 transition hover:border-pink-200/60 hover:bg-pink-200/10"
          >
            Cart {itemCount > 0 ? `(${itemCount})` : ''}
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default function FullAppShell({
  children,
  useAuthProviders = true,
}: {
  children: ReactNode;
  useAuthProviders?: boolean;
}) {
  if (!useAuthProviders) {
    return (
      <ToastProvider>
        <NSFWProvider>
          <AppQueryProvider>
            <CartProvider authState={{ isSignedIn: false, userId: null }}>
              <LocalPublicNavbar />
              {children}
            </CartProvider>
          </AppQueryProvider>
        </NSFWProvider>
      </ToastProvider>
    );
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
