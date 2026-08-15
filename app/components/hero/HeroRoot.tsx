import HeroScene from './HeroScene';
import HeroOverlay from './HeroOverlay';
import HeroContent from './HeroContent';

export default function HeroRoot() {
  return (
    <section
      id="main-content"
      className="relative isolate min-h-[calc(100svh-1px)] w-full overflow-hidden bg-[#080611]"
      aria-labelledby="home-hero-title"
    >
      <HeroScene />
      <HeroOverlay />
      <HeroContent />
    </section>
  );
}
