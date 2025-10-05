// app/page.tsx
import { Suspense } from 'react';
import { env } from '@/env';

// Server components - conditionally imported based on feature flags
import ShopSection from '@/app/(site)/home/ShopSection';
import MiniGamesSection from '@/app/(site)/home/MiniGamesSection';
import BlogSection from '@/app/(site)/home/BlogSection';
import FooterSection from '@/app/(site)/home/FooterSection';
import InteractivePetals from '@/components/hero/InteractivePetals';
import ParallaxBackground from '@/components/background/ParallaxBackground';

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
    <main className="pt-14 relative min-h-screen">
      {/* Parallax Background */}
      <ParallaxBackground theme="cherry" className="fixed inset-0 z-0" />

      {/* Theme Picker - temporarily disabled due to SSR issues */}
      {/* <div className="fixed top-20 right-4 z-50">
        <ThemePicker
          currentTheme="cherry"
          onThemeChange={(_theme) => {
            // Theme change will be handled by client-side state
          }}
        />
      </div> */}

      {/* HERO */}
      {NEXT_PUBLIC_FEATURE_HERO === '1' && (
        <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-pink-300 drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]">
            Welcome home, traveler
          </h1>

          {/* Interactive petals in hero only */}
          {NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE === '1' && (
            <div className="relative mt-6 h-48">
              <InteractivePetals variant="hero" />
            </div>
          )}
        </section>
      )}

      {/* SPACER - breathing room for visible petals before content */}
      {NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE === '1' && (
        <section aria-hidden className="relative z-40 h-[28vh] sm:h-[24vh] lg:h-[32vh]">
          <InteractivePetals variant="spacer" />
        </section>
      )}

      {/* SHOP */}
      {NEXT_PUBLIC_FEATURE_SHOP === '1' && (
        <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <Suspense fallback={<div className="text-pink-200/70">Loading products…</div>}>
            <ShopSection />
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

      {/* BLOG */}
      {NEXT_PUBLIC_FEATURE_BLOG === '1' && (
        <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <Suspense fallback={<div className="text-pink-200/70">Loading posts…</div>}>
            <BlogSection />
          </Suspense>
        </section>
      )}

      {/* FOOTER with Soapstones */}
      <FooterSection showSoapstones={NEXT_PUBLIC_FEATURE_SOAPSTONES === '1'} />
    </main>
  );
}
