import './globals.css';
import type { Metadata } from 'next';
import Footer from './components/Footer';
import Providers from './Providers';
import * as Sentry from '@sentry/nextjs';
import ClerkProviderWrapper from './providers/ClerkProviderWrapper';
import { headers } from 'next/headers';
import CherryBlossomEffect from './components/CherryBlossomEffect';
import CursorGlow from './components/effects/CursorGlow';
import { isCursorGlowEnabled } from './flags';
import PetalHUD from './components/petals/PetalHUD';
import Konami from './components/fun/Konami';
import PetalProgressBar from './components/progress/PetalProgressBar';

export function generateMetadata(): Metadata {
  return {
    title: 'Welcome Home, Traveler — Otaku-mori',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    other: {
      ...Sentry.getTraceData(),
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;

  return (
    <ClerkProviderWrapper nonce={nonce}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Emoji:wght@300..700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen flex flex-col bg-[#080611] text-zinc-100 antialiased selection:bg-fuchsia-400/20 selection:text-fuchsia-50">
          <CherryBlossomEffect density="site" />
          {isCursorGlowEnabled() && <CursorGlow />}
          <PetalHUD />
          <Konami />
          <PetalProgressBar />
          <Sentry.ErrorBoundary
            fallback={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">Something went wrong!</h1>
                <p className="text-gray-400 mt-2">Please refresh the page or contact support.</p>
              </div>
            }
          >
            <Providers>
              <main id="content" className="relative z-20 flex-1">
                {children}
              </main>
              <Footer />
            </Providers>
          </Sentry.ErrorBoundary>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
