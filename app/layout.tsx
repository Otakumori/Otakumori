import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { CartProvider } from '../components/cart/CartProvider';
import { PetalProvider } from '../providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Otakumori - Anime & Manga Community',
  description: 'Join the ultimate anime and manga community. Shop, connect, and explore with fellow otaku.',
  keywords: 'anime, manga, otaku, community, shop, merchandise',
  authors: [{ name: 'Otakumori Team' }],
  creator: 'Otakumori',
  publisher: 'Otakumori',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Otakumori - Anime & Manga Community',
    description: 'Join the ultimate anime and manga community. Shop, connect, and explore with fellow otaku.',
    url: '/',
    siteName: 'Otakumori',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Otakumori - Anime & Manga Community',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Otakumori - Anime & Manga Community',
    description: 'Join the ultimate anime and manga community. Shop, connect, and explore with fellow otaku.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ec4899" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ClerkProvider 
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
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
              }
            }}
          >
            <PetalProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </PetalProvider>
          </ClerkProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
