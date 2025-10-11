// app/page.tsx - Updated imports
import { Suspense } from 'react';
import { env } from '@/env.mjs';

// Legacy components for fallback sections
import ShopTeaser from './components/ShopTeaser';
import BlogTeaser from './components/BlogTeaser';
import MiniGameTeaser from './components/MiniGameTeaser';
import StickySoapstones from './components/StickySoapstones';
import SoapstoneHomeDrift from './components/soapstone/SoapstoneHomeDrift';

// Server components - conditionally imported based on feature flags
import ShopSection from '@/app/(site)/home/ShopSection';
import MiniGamesSection from '@/app/(site)/home/MiniGamesSection';
import BlogSection from '@/app/(site)/home/BlogSection';
import SoapstoneComposer from '@/components/soapstone/SoapstoneComposer';
import InteractivePetals from '@/components/hero/InteractivePetals';

export const revalidate = 60;

export default async function HomePage() {
  const {
    NEXT_PUBLIC_FEATURE_HERO,
    NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE,
    NEXT_PUBLIC_FEATURE_SHOP,
    NEXT_PUBLIC_FEATURE_MINIGAMES,
    NEXT_PUBLIC_FEATURE_BLOG,
    NEXT_PUBLIC_FEATURE_SOAPSTONES,
  } = env;

  return (
    <main className="relative min-h-screen vignette">
      {/* Cherry Blossom Tree (z-[49]) - positioned behind header but above content */}
      <div className="fixed top-0 left-0 w-full h-screen z-[49] pointer-events-none">
        <div
          className="absolute top-0 left-0 opacity-95"
          style={{
            width: '140vw',
            height: '140vh',
            transform: 'translateX(-40%) translateY(-10%)',
            backgroundImage: 'url(/assets/images/cherry-tree.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'left center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Left feather */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/40 to-transparent" />
        {/* Bottom feather */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

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
                <InteractivePetals variant="hero" />
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
      {NEXT_PUBLIC_FEATURE_MINIGAMES === '1' && (
        <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <Suspense fallback={<div className="text-pink-200/70">Loading mini-games…</div>}>
            <MiniGamesSection />
          </Suspense>
        </section>
      )}

      {/* Fallback sections when feature flags are off */}
      {NEXT_PUBLIC_FEATURE_SHOP !== '1' && (
        <section className="bg-gradient-to-b from-transparent via-black/10 to-black/30 py-24">
          <div className="mx-auto w-full max-w-7xl px-4">
            <ShopTeaser />
          </div>
        </section>
      )}

      {NEXT_PUBLIC_FEATURE_BLOG !== '1' && (
        <section className="bg-gradient-to-b from-black/30 via-black/20 to-transparent py-24">
          <div className="mx-auto w-full max-w-7xl px-4">
            <BlogTeaser />
          </div>
        </section>
      )}

      {NEXT_PUBLIC_FEATURE_MINIGAMES !== '1' && (
        <section className="bg-gradient-to-b from-transparent via-black/20 to-black/40 py-24">
          <div className="mx-auto w-full max-w-7xl px-4">
            <MiniGameTeaser />
          </div>
        </section>
      )}

      {/* Soapstones */}
      {NEXT_PUBLIC_FEATURE_SOAPSTONES === '1' && (
        <section className="bg-gradient-to-b from-black/40 to-black/60 py-24">
          <div className="mx-auto w-full max-w-7xl px-4">
            <StickySoapstones />
          </div>
        </section>
      )}

      {/* Soapstones on Home Page (footer content is handled by global Footer) */}
      {NEXT_PUBLIC_FEATURE_SOAPSTONES === '1' && (
        <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="glass-panel rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-pink-200 mb-6">
              Leave a sign for fellow travelers
            </h3>
            <SoapstoneComposer disabled={false} disabledMessage={undefined} />
          </div>
        </section>
      )}

      {/* Existing drift animation layer */}
      <SoapstoneHomeDrift />
    </main>
  );
}
