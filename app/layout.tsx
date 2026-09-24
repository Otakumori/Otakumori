import './globals.css';
import './mori-visual-system.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import ClerkProviderWrapper from './providers/ClerkProviderWrapper';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NSFWProvider } from './contexts/NSFWContext';
import AppQueryProvider from './providers/AppQueryProvider';
import Navbar from './components/layout/Navbar';
import StaticPublicNavbar from './components/layout/StaticPublicNavbar';
import SiteVisualShell from './components/layout/SiteVisualShell';
import { CartProvider } from './components/cart/CartProvider';
import { isLighthouseCiRuntime } from './lib/performance/lighthouseMode';
import { VisualQaAuthProvider } from './lib/visual-qa/clerk-nextjs';
import {
  VISUAL_QA_AUTH_STATE_HEADER,
  isVisualQaAuthEnabled,
  normalizeVisualQaAuthState,
  resolveVisualQaAuthStateFromCookieHeader,
} from './lib/visual-qa/mode';

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: 'Otaku-mori',
  description: 'Anime x gaming shop + play - petals, runes, rewards.',
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;
  const requestHost = headersList.get('host') ?? undefined;
  const useLighthouseShell = isLighthouseCiRuntime();
  const useVisualQaShell = isVisualQaAuthEnabled(undefined, requestHost);
  const visualQaAuthState =
    normalizeVisualQaAuthState(headersList.get(VISUAL_QA_AUTH_STATE_HEADER)) ??
    resolveVisualQaAuthStateFromCookieHeader(headersList.get('cookie')) ??
    'signed-out';

  if (useLighthouseShell) {
    return (
      <html lang="en" className="font-body">
        <body className="font-body">
          <StaticPublicNavbar />
          <SiteVisualShell>{children}</SiteVisualShell>
        </body>
      </html>
    );
  }

  if (useVisualQaShell) {
    return (
      <html lang="en" className="font-body">
        <body className="font-body" data-visual-qa-auth="true">
          <VisualQaAuthProvider initialState={visualQaAuthState}>
            <AppQueryProvider>
              <CartProvider visualQaAuth>
                <StaticPublicNavbar />
                <SiteVisualShell>{children}</SiteVisualShell>
              </CartProvider>
            </AppQueryProvider>
          </VisualQaAuthProvider>
        </body>
      </html>
    );
  }

  return (
    <ClerkProviderWrapper nonce={nonce || undefined} requestHost={requestHost}>
      <html lang="en" className="font-body">
        <body className="font-body">
          <AuthProvider>
            <ToastProvider>
              <NSFWProvider>
                <AppQueryProvider>
                  <CartProvider>
                    <Navbar />
                    <SiteVisualShell>{children}</SiteVisualShell>
                  </CartProvider>
                </AppQueryProvider>
              </NSFWProvider>
            </ToastProvider>
          </AuthProvider>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
