'use client';

import HeroScene from './HeroScene';
import HeroOverlay from './HeroOverlay';
import HeroContent from './HeroContent';

export default function HeroRoot() {
  return (
    <section className="mori-surface mori-paper-texture relative isolate min-h-[100svh] w-full overflow-hidden">
      <HeroScene />
      <HeroOverlay />
      <HeroContent />
    </section>
  );
}
