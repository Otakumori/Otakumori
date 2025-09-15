// Centralized client providers wrapper for App Router
// Ensures all client-side providers are properly nested and available across all routes
'use client';

import React from 'react';
import { CartProvider } from './components/cart/CartProvider';
import { PetalProvider } from '../providers';
import { WorldProvider } from './world/WorldProvider';
import GlobalMusicProvider from '../components/music/GlobalMusicProvider';
import GlobalMusicBar from '../components/music/GlobalMusicBar';
import SoapstoneDock from '../components/SoapstoneDock';
import DockedGacha from '../components/DockedGacha';
import Navbar from './components/layout/Navbar';
import BackdropAbyssMystique from '../components/BackdropAbyssMystique';
import QuakeHUD from './components/hud/QuakeHUD';
import GlobalBackground from './components/GlobalBackground';
import { usePathname } from 'next/navigation';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = (typeof window !== 'undefined' ? window.location.pathname : '/') as string;
  const showTree = pathname === '/about';
  return (
    <WorldProvider>
      <PetalProvider>
        <CartProvider>
          <GlobalMusicProvider>
            {/* Site-wide background (fixed, behind everything) */}
            {showTree && <GlobalBackground />}
            {/* Navigation */}
            <Navbar />
            {children}
            <GlobalMusicBar />
            <SoapstoneDock />
            <DockedGacha />
            <QuakeHUD />
          </GlobalMusicProvider>
        </CartProvider>
      </PetalProvider>
    </WorldProvider>
  );
}
