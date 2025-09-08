import "./globals.css";
import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/app/components/Footer";
import { Providers } from "@/providers";
import * as Sentry from "@sentry/nextjs";
import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
import Starfield from "./components/background/Starfield";
import CherryBlossomEffect from "./components/CherryBlossomEffect";
import CursorGlow from "./components/effects/CursorGlow";
import PetalHUD from "./components/petals/PetalHUD";
import Konami from "./components/fun/Konami";
import PetalProgressBar from "./components/progress/PetalProgressBar";
import { env } from "@/app/env";

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

  const clerkProps: any = {
    dynamic: true,
    nonce,
    publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  };

  if (env.NEXT_PUBLIC_CLERK_SIGN_IN_URL) clerkProps.signInUrl = env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
  if (env.NEXT_PUBLIC_CLERK_SIGN_UP_URL) clerkProps.signUpUrl = env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;
  if (env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL) clerkProps.afterSignInUrl = env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL;
  if (env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL) clerkProps.afterSignUpUrl = env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL;
  if (env.NEXT_PUBLIC_CLERK_DOMAIN) clerkProps.domain = env.NEXT_PUBLIC_CLERK_DOMAIN;
  if (typeof env.NEXT_PUBLIC_CLERK_IS_SATELLITE !== 'undefined') {
    clerkProps.isSatellite = env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true';
  }

  return (
    <ClerkProvider {...clerkProps}>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen flex flex-col bg-[#080611] text-zinc-100 antialiased selection:bg-fuchsia-400/20 selection:text-fuchsia-50">
          <Starfield />
          <CherryBlossomEffect density="site" />
          <CursorGlow />
          <PetalHUD />
          <Konami />
          <PetalProgressBar />
          <Sentry.ErrorBoundary fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-500">Something went wrong!</h1><p className="text-gray-400 mt-2">Please refresh the page or contact support.</p></div>}>
            <Providers>
              <Navigation />
              <main id="content" className="relative z-20 flex-1">
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
