import 'server-only';
import './globals.css';
import './styles/glassmorphic-effects.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { headers } from 'next/headers';
import Footer from './components/Footer';
import Navbar from './components/layout/Navbar';
import Providers from './Providers';
import ClerkProviderWrapper from './providers/ClerkProviderWrapper';
import CherryBlossomEffect from './components/CherryBlossomEffect';
import CursorGlow from './components/effects/CursorGlow';
import PetalHUD from './components/petals/PetalHUD';
import Konami from './components/fun/Konami';
import PetalProgressBar from './components/progress/PetalProgressBar';
import { isCursorGlowEnabled } from './flags';
import ScrollRestoration from './components/util/ScrollRestoration';

export function generateMetadata(): Metadata {
  return {
    title: 'Welcome Home, Traveler - Otaku-mori',
    description: 'Anime and gaming hub for petals, runes, and rewards.',
    other: {
      ...Sentry.getTraceData(),
    },
  };
}

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;

  return (
    <ClerkProviderWrapper nonce={nonce || undefined}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;500;700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Emoji:wght@300..700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200"
            rel="stylesheet"
          />
        </head>
        <body className="flex min-h-screen flex-col bg-[#080611] text-zinc-100 antialiased selection:bg-fuchsia-400/20 selection:text-fuchsia-50">
          <ScrollRestoration />
          <CherryBlossomEffect density="site" />
          {isCursorGlowEnabled() && <CursorGlow />}
          <PetalHUD />
          <Konami />
          <PetalProgressBar />
          <Sentry.ErrorBoundary
            fallback={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">Something went wrong!</h1>
                <p className="mt-2 text-gray-400">Please refresh the page or contact support.</p>
                <p className="mt-4 text-xs text-gray-500">
                  Check the browser console for detailed error information (dev mode only).
                </p>
              </div>
            }
            showDialog={process.env.NODE_ENV === 'development'}
          >
            <Providers>
              <div className="flex min-h-screen flex-col relative z-10">
                <Navbar />
                <main id="main-content" className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </Providers>
          </Sentry.ErrorBoundary>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
