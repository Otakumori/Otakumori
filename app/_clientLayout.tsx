'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ToastProvider } from './components/Toast';
import { PetalEffect } from '@/components/PetalEffect';
import { SoundSettings } from './components/SoundSettings';
import { useAuth } from '@/contexts/AuthContext';
import Providers from '@/providers';
import { Toaster } from 'react-hot-toast';
import Footer, { BottomLogoAndSocials } from './components/Footer';
import FloatingSoapstoneComments from './components/FloatingSoapstoneComments';
import CherryBlossomEffect from './components/CherryBlossomEffect';
import { AnimatePresence } from 'framer-motion';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AnimatePresence mode="wait">
        <CherryBlossomEffect />
        <Providers>
          {children}
          <Toaster position="bottom-right" />
          <FloatingSoapstoneComments />
          <BottomLogoAndSocials />
          <Footer />
          <SoundSettings />
        </Providers>
      </AnimatePresence>
    </ToastProvider>
  );
}
