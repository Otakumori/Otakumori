import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from './components/cart/CartProvider';
import { PetalProvider } from '../providers';

import Navbar from './components/layout/Navbar';
import { medievalFont } from './fonts';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Otakumori - Your Anime Community',
  description:
    'Join Otakumori, your ultimate destination for anime merchandise, manga, and otaku culture.',
  keywords: 'anime, manga, otaku, community, merchandise, figures, art prints',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} ${medievalFont.variable}`}>
      <body className="font-medieval">
        <CartProvider>
          <PetalProvider>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900">
              {children}
            </div>
          </PetalProvider>
        </CartProvider>
      </body>
    </html>
  );
}
