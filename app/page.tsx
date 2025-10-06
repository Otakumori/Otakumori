// app/page.tsx
import { Suspense } from 'react';
import { env } from '@/env.mjs';

// Server components - conditionally imported based on feature flags
import ShopSection from '@/app/(site)/home/ShopSection';
import MiniGamesSection from '@/app/(site)/home/MiniGamesSection';
import BlogSection from '@/app/(site)/home/BlogSection';
import FooterSection from '@/app/(site)/home/FooterSection';
import InteractivePetals from '@/components/hero/InteractivePetals';
import StarfieldBackground from '@/components/background/StarfieldBackground';

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
    <main className="relative min-h-screen">
      {/* Layer 1: Animated Starfield Background (z-0) */}
      <StarfieldBackground className="fixed inset-0 z-0" />

      {/* Layer 2: Cherry Blossom Tree (z-5) - positioned to reveal more on scroll */}
      <div className="fixed top-0 left-0 w-full h-screen z-[5] pointer-events-none">
        <div
          className="absolute top-0 left-0 opacity-95"
          style={{
            width: '120vw',
            height: '120vh',
            transform: 'translateX(-30%)',
            backgroundImage: 'url(/assets/images/cherry-tree.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'left center',
            backgroundRepeat: 'no-repeat',
          }}
        />
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

      {/* FOOTER */}
      <FooterSection />
    </main>
  );
}
