import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/app/components/Footer';
import PetalLayer from '@/app/components/PetalLayer';
import TreeAligner from '@/app/components/TreeAligner';
import { CartProvider } from '@/app/components/cart/CartProvider';
import { Providers } from '@/providers';

export const metadata: Metadata = {
  title: 'Otakumori',
  description: 'Your anime-inspired digital sanctuary',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-gray-100">
        <Providers>
          <CartProvider>
            <TreeAligner />
            <div className="stars-bg" aria-hidden="true" />
            <Navigation />
            <main id="content" className="relative z-10">
              {children}
            </main>
            <Footer />
            <PetalLayer />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
