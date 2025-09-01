// Centralized client providers wrapper for App Router
// Ensures all client-side providers are properly nested and available across all routes
'use client';

import React from 'react';
import { CartProvider } from './components/cart/CartProvider';
import { WorldProvider } from './world/WorldProvider';
import GlobalMusicProvider from '../components/music/GlobalMusicProvider';
import GlobalMusicBar from '../components/music/GlobalMusicBar';
import SoapstoneDock from '../components/SoapstoneDock';
import DockedGacha from '../components/DockedGacha';
import Navbar from './components/layout/Navbar';
import BackdropAbyssMystique from '../components/BackdropAbyssMystique';
import QuakeHUD from './components/hud/QuakeHUD';
import GlobalBackground from './components/GlobalBackground';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WorldProvider>
      <CartProvider>
        <GlobalMusicProvider>
          {/* Site-wide background (fixed, behind everything) */}
          <GlobalBackground />
          {/* Navigation */}
          <Navbar />
          {children}
          <GlobalMusicBar />
          <SoapstoneDock />
          <DockedGacha />
          <QuakeHUD />
        </GlobalMusicProvider>
      </CartProvider>
    </WorldProvider>
  );
}
