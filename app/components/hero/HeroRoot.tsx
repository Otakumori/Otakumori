import HeroScene from './HeroScene';
import HeroOverlay from './HeroOverlay';
import HeroContent from './HeroContent';
import layoutStyles from './HeroLayout.module.css';

export default function HeroRoot() {
  return (
    <section
      id="main-content"
      className={`${layoutStyles.heroRoot} relative isolate w-full overflow-hidden bg-[#080611]`}
      aria-labelledby="home-hero-title"
    >
      <HeroScene />
      <HeroOverlay />
      <HeroContent />
    </section>
  );
}
