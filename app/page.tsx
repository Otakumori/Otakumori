// app/page.tsx - Updated imports
import { Suspense } from 'react';
import { env } from '@/env.mjs';

// Legacy components for fallback sections
import ShopTeaser from './components/ShopTeaser';
import BlogTeaser from './components/BlogTeaser';
import MiniGameTeaser from './components/MiniGameTeaser';
import SoapstoneHomeDrift from './components/soapstone/SoapstoneHomeDrift';

// Server components - conditionally imported based on feature flags
import ShopSection from '@/app/(site)/home/ShopSection';
import MiniGamesSection from '@/app/(site)/home/MiniGamesSection';
import BlogSection from '@/app/(site)/home/BlogSection';
import InteractivePetals from '@/components/hero/InteractivePetals';

// Client-side petal system components
import PetalSystem from './components/petals/PetalSystem';

// Cherry blossom tree background
import TreeBackground from './components/TreeBackground';

export const revalidate = 60;

export default async function HomePage() {
  const {
    NEXT_PUBLIC_FEATURE_HERO,
    NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE,
    NEXT_PUBLIC_FEATURE_SHOP,
    NEXT_PUBLIC_FEATURE_MINIGAMES,
    NEXT_PUBLIC_FEATURE_BLOG,
  } = env;

  return (
    <>
      {/* Cherry blossom tree background - fixed with parallax */}
      <TreeBackground />

      {/* Petal collection system - renders behind main content */}
      <PetalSystem />

      <main className="relative min-h-screen page-transition" style={{ zIndex: 10 }}>
        {/* HERO */}
        {NEXT_PUBLIC_FEATURE_HERO === '1' && (
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center">
              <h1
                className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight"
                style={{ color: '#835D75' }}
              >
                Welcome Home, Traveler
              </h1>

              {/* Interactive petals in hero only */}
              {NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE === '1' && (
                <div className="relative mt-8 h-48">
                  <InteractivePetals />
                </div>
              )}
            </div>
          </section>
        )}

        {/* SHOP */}
        {NEXT_PUBLIC_FEATURE_SHOP === '1' && (
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <Suspense fallback={<div className="text-pink-200/70">Loading shop…</div>}>
              <ShopSection />
            </Suspense>
          </section>
        )}

        {/* BLOG */}
        {NEXT_PUBLIC_FEATURE_BLOG === '1' && (
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <Suspense fallback={<div className="text-pink-200/70">Loading blog…</div>}>
              <BlogSection />
            </Suspense>
          </section>
        )}

        {/* MINI-GAMES */}
        {NEXT_PUBLIC_FEATURE_MINIGAMES === 'on' && (
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <Suspense fallback={<div className="text-pink-200/70">Loading mini-games…</div>}>
              <MiniGamesSection />
            </Suspense>
          </section>
        )}

        {/* Fallback sections when feature flags are off */}
        {NEXT_PUBLIC_FEATURE_SHOP !== 'on' && (
          <section className="bg-gradient-to-b from-transparent via-black/10 to-black/30 py-24">
            <div className="mx-auto w-full max-w-7xl px-4">
              <ShopTeaser />
            </div>
          </section>
        )}

        {NEXT_PUBLIC_FEATURE_BLOG !== 'on' && (
          <section className="bg-gradient-to-b from-black/30 via-black/20 to-transparent py-24">
            <div className="mx-auto w-full max-w-7xl px-4">
              <BlogTeaser />
            </div>
          </section>
        )}

        {NEXT_PUBLIC_FEATURE_MINIGAMES !== 'on' && (
          <section className="bg-gradient-to-b from-transparent via-black/20 to-black/40 py-24">
            <div className="mx-auto w-full max-w-7xl px-4">
              <MiniGameTeaser />
            </div>
          </section>
        )}

        {/* Existing drift animation layer - soapstone now only in footer */}
        <SoapstoneHomeDrift />

        {/* Spacer to ensure footer sits below the tree */}
        <div className="h-64" aria-hidden="true" />
      </main>
    </>
  );
}
