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
import EnhancedStarfieldBackground from './components/backgrounds/EnhancedStarfieldBackground';
import { SakuraPetalField } from './components/effects/SakuraPetalField';
import ScrollableTree from './components/background/ScrollableTree';

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
            1: SakuraPetalField (unified petal animation - clickable but subtle)
            1: ScrollableTree (tree pillar, same level as petals)
            10+: Main content (above all backgrounds)
          */}
          {/* Enhanced starfield background - deepest layer, behind everything */}
          <SafeSection name="StarfieldBackground" fallback={null}>
            <EnhancedStarfieldBackground density={0.5} speed={0.4} zIndex={-11} />
          </SafeSection>

          {/* Unified sakura petal field - single canvas with two coordinated depth layers */}
          {/* Petals at same level as tree (z-index: 1) - clickable but subtle */}
          <SafeSection name="SakuraPetalField" fallback={null}>
            <SakuraPetalField petalCount={45} zIndex={1} />
          </SafeSection>

          {/* Scrollable Cherry Tree - Reveals as you scroll */}
          <ScrollableTree />

          {/* Content column - scrolls beside tree pillar on desktop */}
          {/* Margin adjusted to start where tree becomes visible (~500px from left edge) */}
          <div className="relative min-h-screen page-transition z-10 lg:ml-[500px] xl:ml-[550px]">
            {/* HERO - Always visible */}
            <section
              className="relative z-40 mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-20 md:pb-24 lg:pt-24 lg:pb-28"
            >
              <div className="flex flex-col md:flex-row gap-10">
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

                {/* Hero Content */}
                <div className="flex flex-col justify-center gap-6 md:max-w-xl">
                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-wide text-[var(--om-text-ivory)]">
                    Welcome Home, Traveler.
                  </h1>

                  {/* Rune Icons Grid - Interactive Lore/Navigation */}
                  <div className="mt-6 grid grid-cols-4 gap-4 max-w-md">
                    {[
                      {
                        icon: '✦',
                        href: '/shop',
                        label: 'Shop',
                        lore: "The Merchant's Mark — Where treasures await those with petals to spend.",
                      },
                      {
                        icon: '✧',
                        href: '/mini-games',
                        label: 'Games',
                        lore: "The GameCube's Seal — Enter the realm of challenges and rewards.",
                      },
                      {
                        icon: '✩',
                        href: '/blog',
                        label: 'Lore',
                        lore: "The Scroll's Wisdom — Stories of travelers past and present.",
                      },
                      {
                        icon: '✪',
                        href: '/community',
                        label: 'Community',
                        lore: "The Soapstone's Call — Leave signs for fellow wanderers.",
                      },
                    ].map((rune, i) => (
                      <Link
                        key={i}
                        href={rune.href}
                        className="group aspect-square border border-[var(--om-accent-gold)] bg-[var(--om-bg-surface)] backdrop-blur-sm rounded-lg flex flex-col items-center justify-center hover:bg-[var(--om-accent-pink)]/10 transition-all cursor-pointer relative"
                        aria-label={rune.label}
                      >
                        <span className="text-2xl text-[var(--om-text-ivory)] opacity-60 group-hover:opacity-100 transition-opacity">
                          {rune.icon}
                        </span>
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 backdrop-blur-sm border border-[var(--om-accent-gold)] rounded-lg text-xs text-[var(--om-text-ivory)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap max-w-[200px] text-center z-10">
                          {rune.lore}
                        </div>
                      </Link>
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
                className="relative z-40 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10"
                aria-label="Shop section"
              >
                <SectionErrorBoundary sectionName="shop">
                  <ShopSection />
                </SectionErrorBoundary>
              </section>
            ) : (
              <section
                className="relative z-40 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10"
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
                className="relative z-40 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10"
                aria-label="Mini-games section"
              >
                <SectionErrorBoundary sectionName="mini-games">
                  <MiniGamesSection />
                </SectionErrorBoundary>
              </section>
            ) : (
              <section
                className="relative z-40 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10"
                aria-label="Mini-games section"
              >
                <div className="mx-auto w-full max-w-5xl px-4">
                  <MiniGameTeaser />
                </div>
              </section>
            )}

            {/* BLOG - Always visible (with fallback if disabled) */}
            {NEXT_PUBLIC_FEATURE_BLOG === '1' ||
            NEXT_PUBLIC_FEATURE_BLOG === 'on' ||
            NEXT_PUBLIC_FEATURE_BLOG === 'true' ? (
              <section
                className="relative z-40 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10"
                aria-label="Blog section"
              >
                <SectionErrorBoundary sectionName="blog">
                  <BlogSection />
                </SectionErrorBoundary>
              </section>
            ) : (
              <section
                className="relative z-40 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10"
                aria-label="Blog section"
              >
                <div className="mx-auto w-full max-w-5xl px-4">
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
