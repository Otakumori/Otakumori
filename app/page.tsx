// app/page.tsx - Updated imports
import { env } from '@/env.mjs';

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

export const revalidate = 60;

export default async function HomePage() {
  try {
    const {
      NEXT_PUBLIC_FEATURE_HERO,
      NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE,
      NEXT_PUBLIC_FEATURE_SHOP,
      NEXT_PUBLIC_FEATURE_MINIGAMES,
      NEXT_PUBLIC_FEATURE_BLOG,
    } = env;

    // Check if shop is enabled (accepts '1', 'true', 'on', or any truthy string)
    const isShopEnabled = NEXT_PUBLIC_FEATURE_SHOP === '1' || NEXT_PUBLIC_FEATURE_SHOP === 'true' || NEXT_PUBLIC_FEATURE_SHOP === 'on';

    return (
    <>
      {/* Background Layer Stack - Unified Z-Index Strategy */}
      {/* 
        Z-Index Layering (from back to front):
        -10: TreeBackground (deepest background)
        -8:  CherryPetalLayer (atmospheric petals)
        -7:  PetalFlowOverlay (legacy, can be removed)
        -5:  PetalSystem (interactive collection)
        0:   GlobalBackground (starfield, only on /about)
        10+: Main content (above all backgrounds)
      */}
      <div className="relative">
        {/* Tree hero - deepest layer, behind everything */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -10 }}>
          <TreeBackgroundWrapper />
        </div>
        
        {/* Atmospheric petal layers - above tree, below content */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -8 }}>
          <CherryPetalLayerWrapper />
        </div>
        
        {/* Legacy petal flow overlay - kept for compatibility */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -7 }}>
          <PetalFlowOverlayWrapper />
        </div>
      </div>

      {/* Interactive petal system - clickable, collectible petals with tree-matched colors */}
      <div className="fixed inset-0 pointer-events-auto" style={{ zIndex: -5 }}>
        <HomePetalSystemWrapper />
      </div>

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

            {/* Interactive petals in hero only */}
            {(NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE === '1' || NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE === 'true') && (
              <div className="relative mt-8 h-48">
                <InteractivePetals />
              </div>
            )}
          </div>
        </section>

        {/* SHOP - Always visible (with fallback if disabled) */}
        {isShopEnabled ? (
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10" aria-label="Shop section">
            <SectionErrorBoundary sectionName="shop">
              <ShopSection />
            </SectionErrorBoundary>
          </section>
        ) : (
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10" aria-label="Shop section">
            <div className="text-center py-16">
              <h2 className="text-3xl font-bold text-white mb-4">Shop</h2>
              <p className="text-white/70">Shop section coming soon</p>
            </div>
          </section>
        )}

        {/* MINI-GAMES - Always visible (with fallback if disabled) */}
        {(NEXT_PUBLIC_FEATURE_MINIGAMES === 'on' || NEXT_PUBLIC_FEATURE_MINIGAMES === '1' || NEXT_PUBLIC_FEATURE_MINIGAMES === 'true') ? (
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10" aria-label="Mini-games section">
            <SectionErrorBoundary sectionName="mini-games">
              <MiniGamesSection />
            </SectionErrorBoundary>
          </section>
        ) : (
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10" aria-label="Mini-games section">
            <div className="mx-auto w-full max-w-7xl px-4">
              <MiniGameTeaser />
            </div>
          </section>
        )}

        {/* BLOG - Always visible (with fallback if disabled) */}
        {(NEXT_PUBLIC_FEATURE_BLOG === '1' || NEXT_PUBLIC_FEATURE_BLOG === 'on' || NEXT_PUBLIC_FEATURE_BLOG === 'true') ? (
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10" aria-label="Blog section">
            <SectionErrorBoundary sectionName="blog">
              <BlogSection />
            </SectionErrorBoundary>
          </section>
        ) : (
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10" aria-label="Blog section">
            <div className="mx-auto w-full max-w-7xl px-4">
              <BlogTeaser />
            </div>
          </section>
        )}

        {/* Existing drift animation layer - soapstone now only in footer */}
        <SoapstoneHomeDrift />

        {/* Spacer to ensure footer sits below the tree */}
        <div className="h-64" aria-hidden="true" />
      </div>
    </>
    );
  } catch (error) {
    // Defensive error handling - log but don't crash
    // Fallback to minimal page if something goes wrong
    if (typeof console !== 'undefined' && console.error) {
      console.error('[HomePage] Error rendering page:', error);
    }
    
    // Return minimal fallback page
    return (
      <>
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
      </>
    );
  }
}
