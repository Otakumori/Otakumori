// app/page.tsx - Updated imports
import { generateSEO } from '@/app/lib/seo';
import { env } from '@/env.mjs';
import { featureFlags } from '@/config/featureFlags';
import { handleServerError } from '@/app/lib/server-error-handler';
import HomePageSafe from './_components/HomePageSafe';
import Image from 'next/image';
import Link from 'next/link';

// Legacy components for fallback sections
import BlogTeaser from './components/BlogTeaser';
import MiniGameTeaser from './components/MiniGameTeaser';
import SoapstoneHomeDrift from './components/soapstone/SoapstoneHomeDrift';

// Server components - conditionally imported based on feature flags
import ShopSection from '@/app/(site)/home/ShopSection';
import MiniGamesSection from '@/app/(site)/home/MiniGamesSection';
import BlogSection from '@/app/(site)/home/BlogSection';
import SectionErrorBoundary from './components/home/SectionErrorBoundary';

// TreeBackgroundWrapper ensures tree only renders on home page
import TreeBackgroundWrapper from './components/TreeBackgroundWrapper';
import EnhancedStarfieldBackground from './components/backgrounds/EnhancedStarfieldBackground';
import { SakuraPetalField } from './components/effects/SakuraPetalField';

export const revalidate = 60;

/**
 * Helper component to safely render a section with error handling
 */
function SafeSection({
  name,
  children,
  fallback,
}: {
  name: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  try {
    return <>{children} </>;
  } catch (error) {
    handleServerError(
      error,
      {
        section: 'homepage',
        component: `HomePage.${name}`,
        operation: `render_${name.toLowerCase()}`,
      },
      {
        logLevel: 'warn',
        throwAfterLogging: false,
      },
    );
    return <>{fallback || null} </>;
  }
}

export function generateMetadata() {
  return generateSEO({
    title: 'Welcome Home, Traveler — Otaku-mori',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/',
  });
}
export default async function HomePage() {
  try {
    const {
      NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE,
      NEXT_PUBLIC_FEATURE_SHOP,
      NEXT_PUBLIC_FEATURE_MINIGAMES,
      NEXT_PUBLIC_FEATURE_BLOG,
    } = env;

    // Get feature flags
    const isHomepageExperimentalEnabled = featureFlags.HOMEPAGE_EXPERIMENTAL_ENABLED;

    // Check if shop is enabled (accepts '1', 'true', 'on', or any truthy string)
    const isShopEnabled =
      NEXT_PUBLIC_FEATURE_SHOP === '1' ||
      NEXT_PUBLIC_FEATURE_SHOP === 'true' ||
      NEXT_PUBLIC_FEATURE_SHOP === 'on';

    return (
      <HomePageSafe>
        <>
          {/* Background Layer Stack - Unified Z-Index Strategy */}
          {/* 
            Z-Index Layering (from back to front):
            -11: StarfieldBackground (deepest background, animated starfield)
            -5: SakuraPetalField (unified petal animation with two depth layers)
            0: Tree pillar (static art, left-justified)
            10+: Main content (above all backgrounds)
          */}
          {isHomepageExperimentalEnabled && (
            <>
              {/* Enhanced starfield background - deepest layer, behind everything */}
              <SafeSection name="StarfieldBackground" fallback={null}>
                <EnhancedStarfieldBackground density={0.5} speed={0.4} zIndex={-11} />
              </SafeSection>
            </>
          )}

          {/* Unified sakura petal field - single canvas with two coordinated depth layers */}
          {isHomepageExperimentalEnabled && (
            <SafeSection name="SakuraPetalField" fallback={null}>
              <SakuraPetalField petalCount={90} />
            </SafeSection>
          )}

          {/* Fixed Cherry Tree Pillar - LEFT SIDE */}
          {/* Full viewport height, fixed width, content scrolls beside it */}
          <aside
            className="hidden lg:block fixed inset-y-0 left-0 z-0 pointer-events-none w-[360px] xl:w-[420px]"
            aria-hidden="true"
          >
            <div className="relative w-full h-full">
              <Image
                src="/assets/images/cherry-tree.png"
                alt=""
                fill
                priority
                className="object-cover object-center"
                sizes="(min-width: 1024px) 360px, (min-width: 1280px) 420px"
              />
              {/* Gradient overlay to blend with content */}
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-[#080611] via-[#080611]/40 to-transparent pointer-events-none" />
            </div>
          </aside>

          {/* Content column - scrolls beside tree pillar on desktop */}
          <div className="relative min-h-screen page-transition z-10 lg:ml-[360px] xl:ml-[420px]">
            {/* HERO - Always visible */}
            <section
              className="relative z-40 mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-20 md:pb-24 lg:pt-24 lg:pb-28"
            >
              <div className="flex flex-col md:flex-row md:justify-end gap-10">
                {/* Mobile: Show tree inline */}
                <div className="relative h-72 md:hidden -ml-4">
                  <Image
                    src="/assets/images/cherry-tree.png"
                    alt="Sakura tree overlooking Otakumori"
                    fill
                    priority
                    className="object-contain object-left pointer-events-none select-none"
                  />
                </div>

                {/* Hero Content - Right side on desktop */}
                <div className="flex flex-col justify-center gap-6 md:max-w-xl md:ml-auto">
                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-wide text-[var(--om-text-ivory)]">
                    Welcome Home, Traveler.
                  </h1>

                  {/* Rune Icons Grid */}
                  <div className="mt-6 grid grid-cols-4 gap-4 max-w-md">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="aspect-square border border-[var(--om-accent-gold)] bg-[var(--om-bg-surface)] backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-[var(--om-accent-pink)]/10 transition-all cursor-pointer"
                        aria-label={`Category ${i}`}
                      >
                        <span className="text-2xl text-[var(--om-text-ivory)] opacity-60">✦</span>
                      </div>
                    ))}
                  </div>

                  {/* CTAs - Hidden for now, icons replace them */}
                  <div className="hidden mt-6 flex-col sm:flex-row gap-4">
                    <Link
                      href="/shop"
                      className="px-6 py-3 border border-[var(--om-accent-gold)] bg-[var(--om-bg-surface)] backdrop-blur-sm text-[var(--om-text-ivory)] rounded-lg hover:bg-[var(--om-accent-pink)]/10 transition-colors text-center"
                    >
                      Enter the Shop
                    </Link>
                    <Link
                      href="/mini-games"
                      className="px-6 py-3 border border-[var(--om-accent-gold)] bg-[var(--om-bg-surface)] backdrop-blur-sm text-[var(--om-text-ivory)] rounded-lg hover:bg-[var(--om-accent-pink)]/10 transition-colors text-center"
                    >
                      Play Mini-Games
                    </Link>
                    <Link
                      href="/blog"
                      className="px-6 py-3 border border-[var(--om-accent-gold)] bg-[var(--om-bg-surface)] backdrop-blur-sm text-[var(--om-text-ivory)] rounded-lg hover:bg-[var(--om-accent-pink)]/10 transition-colors text-center"
                    >
                      Read the Lore
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* SHOP - Always visible (with fallback if disabled) */}
            {isShopEnabled ? (
              <section
                className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
                aria-label="Shop section"
              >
                <SectionErrorBoundary sectionName="shop">
                  <ShopSection />
                </SectionErrorBoundary>
              </section>
            ) : (
              <section
                className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
                aria-label="Shop section"
              >
                <div className="text-center py-16">
                  <h2 className="text-3xl font-bold text-white mb-4">Shop</h2>
                  <p className="text-white/70">Shop section coming soon</p>
                </div>
              </section>
            )}

            {/* MINI-GAMES - Always visible (with fallback if disabled) */}
            {NEXT_PUBLIC_FEATURE_MINIGAMES === 'on' ? (
              <section
                className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
                aria-label="Mini-games section"
              >
                <SectionErrorBoundary sectionName="mini-games">
                  <MiniGamesSection />
                </SectionErrorBoundary>
              </section>
            ) : (
              <section
                className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
                aria-label="Mini-games section"
              >
                <div className="mx-auto w-full max-w-7xl px-4">
                  <MiniGameTeaser />
                </div>
              </section>
            )}

            {/* BLOG - Always visible (with fallback if disabled) */}
            {NEXT_PUBLIC_FEATURE_BLOG === '1' ||
            NEXT_PUBLIC_FEATURE_BLOG === 'on' ||
            NEXT_PUBLIC_FEATURE_BLOG === 'true' ? (
              <section
                className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
                aria-label="Blog section"
              >
                <SectionErrorBoundary sectionName="blog">
                  <BlogSection />
                </SectionErrorBoundary>
              </section>
            ) : (
              <section
                className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
                aria-label="Blog section"
              >
                <div className="mx-auto w-full max-w-7xl px-4">
                  <BlogTeaser />
                </div>
              </section>
            )}

            {/* Existing drift animation layer - soapstone now only in footer */}
            <SafeSection name="SoapstoneDrift" fallback={null}>
              <SoapstoneHomeDrift />
            </SafeSection>

            {/* Spacer to ensure footer sits below the tree */}
            <div className="h-64" aria-hidden="true" />
          </div>
        </>
      </HomePageSafe>
    );
  } catch (error) {
    // Log error with full context
    handleServerError(
      error,
      {
        section: 'homepage',
        component: 'HomePage',
        operation: 'render_homepage',
        metadata: {
          timestamp: new Date().toISOString(),
          nodeEnv: process.env.NODE_ENV,
        },
      },
      {
        logLevel: 'error',
        throwAfterLogging: false, // Don't throw - HomePageSafe will handle fallback
      },
    );

    // Return safe wrapper which will show fallback
    return (
      <HomePageSafe>
        <div className="relative min-h-screen page-transition" style={{ zIndex: 10 }}>
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center">
              <h1
                className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight"
                style={{ color: '#835D75' }}
              >
                Welcome Home, Traveler
              </h1>
              <p className="mt-4 text-xl text-white/70">
                Anime x gaming shop + play — petals, runes, rewards.
              </p>
            </div>
          </section>
        </div>
      </HomePageSafe>
    );
  }
}
