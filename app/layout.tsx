import 'server-only';
import './globals.css';
import type { Metadata } from 'next';
import Footer from './components/Footer';
import Navbar from './components/layout/Navbar';
import Providers from './Providers';
import * as Sentry from '@sentry/nextjs';
import ClerkProviderWrapper from './providers/ClerkProviderWrapper';
import ClientErrorBoundary from '@/components/ClientErrorBoundary';
import { headers } from 'next/headers';
import CursorGlow from './components/effects/CursorGlow';
import { isCursorGlowEnabled } from './flags';
import PetalHUD from './components/petals/PetalHUD';
import Konami from './components/fun/Konami';
import PetalProgressBar from './components/progress/PetalProgressBar';
import GoogleAnalytics from './components/analytics/GoogleAnalytics';
import PerformanceMonitor from './components/PerformanceMonitor';
import { bootCheckInngest } from '@/lib/inngestHealth';

// Boot-time Inngest health check (fire-and-forget)
bootCheckInngest();

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
        <body className="min-h-screen flex flex-col bg-[#080611] text-zinc-100 antialiased selection:bg-fuchsia-400/20 selection:text-fuchsia-50 font-body">
          <GoogleAnalytics />
          <PerformanceMonitor />
          {/* CherryBlossomEffect moved to Home page only for v0 spec compliance */}
          {isCursorGlowEnabled() && <CursorGlow />}
          <PetalHUD />
          <Konami />
          <PetalProgressBar />
          <ClientErrorBoundary>
            <Providers>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main id="main-content" className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </Providers>
          </ClientErrorBoundary>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
