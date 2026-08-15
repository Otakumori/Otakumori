import HeroScene from './HeroScene';
import HeroOverlay from './HeroOverlay';
import HeroContent from './HeroContent';

export default function HeroRoot() {
  return (
    <section
      id="main-content"
      className="relative isolate min-h-[138svh] w-full overflow-hidden bg-[#080611] md:min-h-[128svh] xl:min-h-[122svh]"
      aria-labelledby="home-hero-title"
    >
      <HeroScene />
      <HeroOverlay />
      <HeroContent />
    </section>
  );
}
