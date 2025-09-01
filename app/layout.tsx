import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { env } from '@/env.mjs';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorBoundary as DevErrorBoundary } from '../components/dev/ErrorBoundary';
import ClientErrorTrap from '../components/dev/ClientErrorTrap';
import Providers from './Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Otaku-Mori ❤︎',
  description: 'Welcome to Otaku-Mori, where anime and gaming <co-exist>!',
  keywords: 'anime, gaming, otaku, community, shop, mini-games',
  authors: [{ name: 'Otaku-Mori Team' }],
  creator: 'Otaku-Mori',
  publisher: 'Otaku-Mori',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://otaku-mori.com',
    title: 'Otaku-Mori ❤︎',
    description: 'Welcome to Otaku-Mori, where anime and gaming <co-exist>!',
    siteName: 'Otaku-Mori',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Otaku-Mori ❤︎',
    description: 'Welcome to Otaku-Mori, where anime and gaming <co-exist>!',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  themeColor: '#ec4899',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Boot logging for Clerk instance detection (server-only)
if (typeof window === 'undefined') {
  try {
    const isTest = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_');
    const isLive = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_');
    console.log(`🚀 Clerk Boot: Using ${isTest ? 'TEST' : isLive ? 'LIVE' : 'UNKNOWN'} instance`);
    console.log(`🌐 APP_URL: ${env.NEXT_PUBLIC_APP_URL || 'Not set'}`);
  } catch (error) {
    // Silently fail if env is not available (e.g., during build)
    console.log('🚀 Clerk Boot: Environment not available during build');
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth bg-black text-gray-100">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ec4899" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ClerkProvider
            publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
              elements: {
                formButtonPrimary: 'bg-pink-600 hover:bg-pink-700 text-white',
                card: 'bg-gray-900 border border-pink-500/20',
                headerTitle: 'text-white',
                headerSubtitle: 'text-gray-300',
                socialButtonsBlockButton: 'bg-gray-800 hover:bg-gray-700 border border-pink-500/20',
                formFieldInput: 'bg-gray-800 border border-pink-500/20 text-white',
                formFieldLabel: 'text-gray-300',
                footerActionLink: 'text-pink-400 hover:text-pink-300',
              },
            }}
          >
            <DevErrorBoundary>
              <ClientErrorTrap />
              <Providers>
                {children}
              </Providers>
            </DevErrorBoundary>
          </ClerkProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
