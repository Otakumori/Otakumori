import PixelatedStarfield from './components/background/PixelatedStarfield';
import FallingPetals from './components/background/FallingPetals';
import CherryBlossomTree from './components/background/CherryBlossomTree';
import CherryBlossomEffect from './components/CherryBlossomEffect';
import HeroIntro from './components/HeroIntro';
import ShopTeaser from './components/ShopTeaser';
import BlogTeaser from './components/BlogTeaser';
import MiniGameTeaser from './components/MiniGameTeaser';
import StickySoapstones from './components/StickySoapstones';
import SoapstoneHomeDrift from './components/soapstone/SoapstoneHomeDrift';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background layers */}
      <PixelatedStarfield />
      <FallingPetals />
      <CherryBlossomTree />
      <CherryBlossomEffect density="home" />

      {/* Main content with improved spacing and layout */}
      <div className="relative z-10">
        {/* Hero Section - Full viewport height */}
        <section className="min-h-screen flex items-center justify-center pt-20">
          <div className="w-full max-w-7xl mx-auto px-4">
            <HeroIntro />
          </div>
        </section>

        {/* Shop Section */}
        <section className="py-24 bg-gradient-to-b from-transparent via-black/10 to-black/30">
          <div className="w-full max-w-7xl mx-auto px-4">
            <ShopTeaser />
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-24 bg-gradient-to-b from-black/30 via-black/20 to-transparent">
          <div className="w-full max-w-7xl mx-auto px-4">
            <BlogTeaser />
          </div>
        </section>

        {/* Mini Games Section */}
        <section className="py-24 bg-gradient-to-b from-transparent via-black/20 to-black/40">
          <div className="w-full max-w-7xl mx-auto px-4">
            <MiniGameTeaser />
          </div>
        </section>

        {/* Soapstones Section */}
        <section className="py-24 bg-gradient-to-b from-black/40 to-black/60">
          <div className="w-full max-w-7xl mx-auto px-4">
            <StickySoapstones />
          </div>
        </section>
      </div>
      
      {/* Soapstone drift animation */}
      <SoapstoneHomeDrift />
    </div>
  );
}
