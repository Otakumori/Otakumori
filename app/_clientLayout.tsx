'use client';

import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import Footer, { BottomLogoAndSocials } from './components/Footer';
import FloatingSoapstoneComments from './components/FloatingSoapstoneComments';
import CherryBlossomEffect from './components/CherryBlossomEffect';
import { ToastProvider } from '@/components/Toast';
import { AnimatePresence } from 'framer-motion';
import { SoundSettings } from '@/components/SoundSettings';

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
