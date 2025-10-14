// Centralized client providers wrapper for App Router
// Ensures all client-side providers are properly nested and available across all routes
'use client';

import React from 'react';
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

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = (typeof window !== 'undefined' ? window.location.pathname : '/') as string;
  const showTree = pathname === '/about';
  return (
    <PostHogProvider>
      <ClerkPostHogBridge />
      <ToastProvider>
        <AuthProvider>
          <WorldProvider>
            <PetalProvider>
              <CartProvider>
                <GlobalMusicProvider>
                  {/* Site-wide background (fixed, behind everything) */}
                  {showTree && <GlobalBackground />}
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
  );
}
