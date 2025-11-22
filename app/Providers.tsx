// Centralized client providers wrapper for App Router
// Ensures all client-side providers are properly nested and available across all routes
'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './components/cart/CartProvider';
import { PetalProvider } from '../providers';
import { WorldProvider } from './world/WorldProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import GlobalMusicProvider from '../components/music/GlobalMusicProvider';
import GlobalMusicBar from '../components/music/GlobalMusicBar';
import SoapstoneDock from '../components/SoapstoneDock';
import QuakeHUD from './components/hud/QuakeHUD';
import GlobalBackground from './components/GlobalBackground';
import PostHogProvider from './providers/PostHogProvider.safe';
import ClerkPostHogBridge from './(site)/_providers/ClerkPostHogBridge.safe';
import { isStarfieldEnabled } from './flags';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStarfieldOn = isStarfieldEnabled();
  // Don't show GlobalBackground on home page - TreeBackgroundWrapper handles it
  const showStarfield = isStarfieldOn && pathname === '/about';

  // Create QueryClient instance (singleton pattern for React Query)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider>
        <ClerkPostHogBridge />
        <ToastProvider>
          <AuthProvider>
            <WorldProvider>
              <PetalProvider>
                <CartProvider>
                  <GlobalMusicProvider>
                    {/* Site-wide starfield background (fixed, behind everything, z-0) */}
                    {showStarfield && <GlobalBackground />}
                    {children}
                    <GlobalMusicBar />
                    <SoapstoneDock />
                    <QuakeHUD />
                  </GlobalMusicProvider>
                </CartProvider>
              </PetalProvider>
            </WorldProvider>
          </AuthProvider>
        </ToastProvider>
      </PostHogProvider>
    </QueryClientProvider>
  );
}
