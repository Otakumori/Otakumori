import HeroScene from './HeroScene';
import HeroOverlay from './HeroOverlay';
import HeroContent from './HeroContent';
import { PetalCollectionProvider } from '@/app/contexts/PetalCollectionContext';
import PetalSystem from '@/app/components/petals/PetalSystem';
import layoutStyles from './HeroLayout.module.css';

export default function HeroRoot() {
  return (
    <section
      id="main-content"
      className={`${layoutStyles.heroRoot} relative isolate w-full overflow-hidden bg-[#080611]`}
      aria-labelledby="home-hero-title"
    >
      <PetalCollectionProvider>
        <HeroScene />
        <PetalSystem />
        <HeroOverlay />
        <HeroContent />
      </PetalCollectionProvider>
    </section>
  );
}
