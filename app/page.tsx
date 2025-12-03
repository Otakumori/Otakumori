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
import HomeHeroPetals from './components/petals/HomeHeroPetals';

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
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/page.tsx',
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
            -10: TreeBackground (cherry blossom tree image - disabled, using inline tree in hero)
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

          <div className="relative min-h-screen page-transition" style={{ zIndex: 10 }}>
            {/* HERO - Always visible */}
            <section
              className="relative z-40 mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-20 md:pb-24 lg:pt-24 lg:pb-28"
              style={{ zIndex: 10 }}
            >
              <div className="grid gap-10 md:grid-cols-[minmax(0,0.40fr)_minmax(0,0.60fr)]">
                {/* Left: Sakura Tree */}
                <div className="relative h-72 md:h-[420px] lg:h-[480px] -ml-4 md:-ml-8">
                  <Image
                    src="/assets/images/cherry-tree.png"
                    alt="Sakura tree overlooking Otakumori"
                    fill
                    priority
                    className="object-contain object-left pointer-events-none select-none"
                  />
                  {/* Petal system overlay - only on hero tree area */}
                  {isHomepageExperimentalEnabled && (
                    <SafeSection name="HomeHeroPetals" fallback={null}>
                      <HomeHeroPetals />
                    </SafeSection>
                  )}
                </div>

                {/* Right: Hero Content */}
                <div className="flex flex-col justify-center gap-6">
                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-wide text-[var(--om-text-ivory)]">
                    Welcome Home, Traveler.
                  </h1>

                  {/* Rune Icons Grid */}
                  <div className="mt-6 grid grid-cols-4 gap-4 max-w-md">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="aspect-square border border-[var(--om-border-soft)] bg-[var(--om-bg-surface)] rounded-lg flex items-center justify-center"
                        aria-label={`Rune symbol ${i}`}
                      >
                        <span className="text-2xl text-[var(--om-text-ivory)] opacity-60">✦</span>
                      </div>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/shop"
                      className="px-6 py-3 border border-[var(--om-border-strong)] bg-[var(--om-bg-surface)] text-[var(--om-text-ivory)] rounded-lg hover:bg-[var(--om-accent-pink)]/10 transition-colors text-center"
                    >
                      Enter the Shop
                    </Link>
                    <Link
                      href="/mini-games"
                      className="px-6 py-3 border border-[var(--om-border-strong)] bg-[var(--om-bg-surface)] text-[var(--om-text-ivory)] rounded-lg hover:bg-[var(--om-accent-pink)]/10 transition-colors text-center"
                    >
                      Play Mini-Games
                    </Link>
                    <Link
                      href="/blog"
                      className="px-6 py-3 border border-[var(--om-border-strong)] bg-[var(--om-bg-surface)] text-[var(--om-text-ivory)] rounded-lg hover:bg-[var(--om-accent-pink)]/10 transition-colors text-center"
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
