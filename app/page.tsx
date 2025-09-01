'use client';

import { HeroShrine } from '@/components/hero/HeroShrine';
import { FeaturedProducts } from '@/components/hero/FeaturedProducts';
import { SeasonalCollectionBand } from '@/components/hero/SeasonalCollectionBand';
import { MiniGamesTeaser } from '@/components/hero/MiniGamesTeaser';
import { BlogTeaser } from '@/components/hero/BlogTeaser';
import { InsidersSignup } from '@/components/hero/InsidersSignup';
import { CompactFooter } from '@/components/hero/CompactFooter';
import TreeAligner from '@/app/components/TreeAligner';
import HomeTreeToggle from '@/app/components/HomeTreeToggle';
import PetalLayer from '@/app/components/PetalLayer';

export default function HomePage() {
  return (
    <>
      <HomeTreeToggle visible />
      <TreeAligner />
      <PetalLayer mode="interactive" density={0.6} />
      <main className="relative">
        {/* 1. Hero Shrine */}
        <HeroShrine />

        {/* 2. Featured Products */}
        <FeaturedProducts />

        {/* 3. Seasonal Collection Band */}
        <SeasonalCollectionBand />

        {/* 4. Mini-Games Teaser */}
        <MiniGamesTeaser />

        {/* 5. Blog Teaser */}
        <BlogTeaser />

        {/* 6. Insiders Signup */}
        <InsidersSignup />

        {/* 7. Compact Footer */}
        <CompactFooter />
      </main>
    </>
  );
}

export const dynamic = 'force-dynamic';
