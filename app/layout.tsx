// DEPRECATED: This component is a duplicate. Use app\components\components\Layout.jsx instead.
import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/app/components/Footer';
import { Providers } from '@/providers';

export const metadata: Metadata = {
  title: 'Welcome Home, Traveler — Otaku-mori',
  description: 'Anime x gaming shop + play — petals, runes, rewards.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#080611] text-zinc-100 antialiased selection:bg-fuchsia-400/20 selection:text-fuchsia-50">
        <Providers>
          <Navigation />
          <main id="content" className="relative z-10">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
