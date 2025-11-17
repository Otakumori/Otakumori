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

// Client-side petal system components
import PetalSystem from './components/petals/PetalSystem';
import PhysicsCherryPetals from './components/petals/PhysicsCherryPetals';
import SakuraPetalBackground from './components/petals/SakuraPetalBackground';

// TreeBackgroundWrapper ensures tree only renders on home page
import TreeBackgroundWrapper from './components/TreeBackgroundWrapper';
import { PetalFlowOverlayWrapper } from './components/home/PetalFlowOverlayWrapper';
import { CherryPetalLayerWrapper } from '@/app/(site)/home/CherryPetalLayerWrapper';

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

      {/* Interactive petal systems - above atmospheric layers, below content */}
      {/* New Sakura Petal Background - real petal shapes with proper physics */}
      <SakuraPetalBackground
        enabled={NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE === '1' || NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE === 'true'}
        maxPetals={30}
        spawnInterval={2000}
        hitRadius={32}
      />

      {/* Legacy petal systems - kept for compatibility, can be removed after testing */}
      {/* Physics-based cherry blossom petals - clickable/collectible */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -5 }}>
        <PhysicsCherryPetals density={2} onCollect={(_id) => {
          // Silent collection - no UI feedback, just tracking
          // Could be used for analytics, achievements, etc.
        }} />
      </div>

      {/* Petal collection system - renders behind main content but above backgrounds */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -5 }}>
        <PetalSystem />
      </div>

      <div className="relative min-h-screen page-transition" style={{ zIndex: 10 }}>
        {/* SHOP */}
        {isShopEnabled && (
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <SectionErrorBoundary sectionName="shop">
              <ShopSection />
            </SectionErrorBoundary>
          </section>
        )}

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

        {/* BLOG */}
        {NEXT_PUBLIC_FEATURE_BLOG === '1' && (
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <SectionErrorBoundary sectionName="blog">
              <BlogSection />
            </SectionErrorBoundary>
          </section>
        )}

        {/* MINI-GAMES */}
        {NEXT_PUBLIC_FEATURE_MINIGAMES === 'on' && (
          <section className="relative z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <SectionErrorBoundary sectionName="mini-games">
              <MiniGamesSection />
            </SectionErrorBoundary>
          </section>
        )}

        {/* Fallback sections when feature flags are off */}
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
