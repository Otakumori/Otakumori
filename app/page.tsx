// app/page.tsx - Updated imports
import { env } from '@/env.mjs';
import { featureFlags } from '@/config/featureFlags';
import { handleServerError } from '@/app/lib/server-error-handler';
import HomePageSafe from './_components/HomePageSafe';

// Legacy components for fallback sections
import BlogTeaser from './components/BlogTeaser';
import MiniGameTeaser from './components/MiniGameTeaser';
import SoapstoneHomeDrift from './components/soapstone/SoapstoneHomeDrift';

// Server components - conditionally imported based on feature flags
import ShopSection from '@/app/(site)/home/ShopSection';
import MiniGamesSection from '@/app/(site)/home/MiniGamesSection';
import BlogSection from '@/app/(site)/home/BlogSection';
import InteractivePetals from '@/components/hero/InteractivePetals';
import SectionErrorBoundary from './components/home/SectionErrorBoundary';

// TreeBackgroundWrapper ensures tree only renders on home page
import TreeBackgroundWrapper from './components/TreeBackgroundWrapper';
import { PetalFlowOverlayWrapper } from './components/home/PetalFlowOverlayWrapper';
import { CherryPetalLayerWrapper } from '@/app/(site)/home/CherryPetalLayerWrapper';
import HomePetalSystemWrapper from './components/home/HomePetalSystemWrapper';
import StarfieldBackground from './components/backgrounds/StarfieldBackground';

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
            -10: TreeBackground (cherry blossom tree image)
            -8:  CherryPetalLayer (atmospheric petals)
            -7:  PetalFlowOverlay (legacy, can be removed)
            -5:  PetalSystem (interactive collection)
            10+: Main content (above all backgrounds)
          */}
          {isHomepageExperimentalEnabled && (
            <div className="relative">
        {/* Starfield background - deepest layer, behind everything */ }
        < SafeSection name = "StarfieldBackground" fallback = { null} >
          <StarfieldBackground density={ 0.72 } speed = { 0.62} zIndex = {- 11
    } />
      </SafeSection>

    {/* Tree hero - above starfield, behind petals */ }
              <SafeSection name="TreeBackground" fallback={null}>
                <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -10 }}>
                  <TreeBackgroundWrapper />
                </div>
              </SafeSection>

              {/* Atmospheric petal layers - above tree, below content */}
              <SafeSection name="CherryPetalLayer" fallback={null}>
                <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -8 }}>
                  <CherryPetalLayerWrapper />
                </div>
              </SafeSection>

              {/* Legacy petal flow overlay - kept for compatibility */}
              <SafeSection name="PetalFlowOverlay" fallback={null}>
                <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -7 }}>
                  <PetalFlowOverlayWrapper />
                </div>
              </SafeSection>
            </div>
          )}

          {/* Interactive petal system - clickable, collectible petals with tree-matched colors */}
          {isHomepageExperimentalEnabled && (
            <SafeSection name="HomePetalSystem" fallback={null}>
              <div className="fixed inset-0 pointer-events-auto" style={{ zIndex: -5 }}>
                <HomePetalSystemWrapper />
              </div>
            </SafeSection>
          )}

          <div className="relative min-h-screen page-transition" style={{ zIndex: 10 }}>
            {/* HERO - Always visible */}
            <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
              <div className="text-center">
                <h1
                  className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight"
                  style={{ color: '#835D75' }}
                >
                  Welcome Home, Traveler
                </h1>

                {/* Interactive petals in hero only - gated behind experimental flag */}
                {isHomepageExperimentalEnabled &&
                  (NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE === '1' ||
                    NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE === 'true') && (
                    <SafeSection name="InteractivePetals" fallback={null}>
                      <div className="relative mt-8 h-48">
                        <InteractivePetals />
                      </div>
                    </SafeSection>
                  )}
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
