import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/app/components/Footer';
import { Providers } from '@/providers';
import * as Sentry from '@sentry/nextjs';
import { ClerkProvider } from '@clerk/nextjs';
import { headers } from 'next/headers';
import Starfield from './components/background/Starfield';
import { env } from '@/env';

export function generateMetadata(): Metadata {
  return {
    title: 'Welcome Home, Traveler — Otaku-mori',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    other: {
      ...Sentry.getTraceData(),
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = headers().get('x-nonce') ?? undefined;

  return (
    <ClerkProvider
      dynamic
      nonce={nonce}
      publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-[#080611] text-zinc-100 antialiased selection:bg-fuchsia-400/20 selection:text-fuchsia-50">
          <Starfield />
          <Sentry.ErrorBoundary
            fallback={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">Something went wrong!</h1>
                <p className="text-gray-400 mt-2">Please refresh the page or contact support.</p>
              </div>
            }
          >
            <Providers>
              <Navigation />
              <main id="content" className="relative z-10">
                {children}
              </main>
              <Footer />
            </Providers>
          </Sentry.ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
