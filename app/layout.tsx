import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from './components/cart/CartProvider';
import { AchievementProvider } from './contexts/AchievementContext';
import Navbar from './components/layout/Navbar';
import { medievalFont } from './fonts';
import * as Sentry from '@sentry/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Otakumori - Your Anime Community',
  description:
    'Join Otakumori, your ultimate destination for anime merchandise, manga, and otaku culture.',
  keywords: 'anime, manga, otaku, community, merchandise, figures, art prints',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={
        <div className="p-8 text-pink-200">An error has occurred. Please try again later.</div>
      }
    >
      <button
        onClick={() => {
          throw new Error('This is your first error!');
        }}
        aria-label="Trigger Sentry test error"
        className="fixed bottom-4 right-4 z-50 rounded bg-pink-400/30 px-4 py-2 text-pink-100 shadow transition hover:bg-pink-400/50"
      >
        Break the world
      </button>
      <html lang="en" className={`${inter.className} ${medievalFont.variable}`}>
        <body className="font-medieval">
          <CartProvider>
            <AchievementProvider>
              <Navbar />
              <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900">
                {children}
              </div>
            </AchievementProvider>
          </CartProvider>
        </body>
      </html>
    </Sentry.ErrorBoundary>
  );
}
