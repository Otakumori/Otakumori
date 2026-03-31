'use client';

import HeroScene from './HeroScene';
import HeroOverlay from './HeroOverlay';
import HeroContent from './HeroContent';

export default function HeroRoot() {
  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-hidden bg-[#080611]">
      <HeroScene />
      <HeroOverlay />
      <HeroContent />
    </section>
  );
}
