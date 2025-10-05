// app/page.tsx
// BEFORE:
// import PixelatedStarfield from './components/background/PixelatedStarfield';
// import FallingPetals from './components/background/FallingPetals';
// import CherryBlossomTree from './components/background/CherryBlossomTree';
import CherryBlossomEffect from './components/CherryBlossomEffect';
import HeroIntro from './components/HeroIntro';
import ShopTeaser from './components/ShopTeaser';
import BlogTeaser from './components/BlogTeaser';
import MiniGameTeaser from './components/MiniGameTeaser';
import StickySoapstones from './components/StickySoapstones';
import SoapstoneHomeDrift from './components/soapstone/SoapstoneHomeDrift';

export const revalidate = 300;

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Static background: show the RIGHT half only */}
      <div className="absolute inset-0 overflow-hidden">
        {/* If you have /public/images/home-hero.jpg, use that path */}
        <img
          src="/images/cherry-blossom-tree.jpg"
          alt="Cherry blossom background"
          className="h-full w-[200%] translate-x-[-50%] object-cover"
          loading="eager"
        />
      </div>

      {/* Soft light-pink wash for readability (optional) */}
      <div className="absolute inset-0 bg-[#FFE4E1]/55" />

      {/* Petals ON TOP of image */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <CherryBlossomEffect density="home" />
      </div>

      {/* Main content */}
      <div className="relative z-20">
        {/* Hero Section - full viewport height */}
        <section className="min-h-screen flex items-center justify-center pt-20">
          <div className="mx-auto w-full max-w-7xl px-4">
            <HeroIntro />
          </div>
        </section>

        {/* Shop */}
        <section className="bg-gradient-to-b from-transparent via-black/10 to-black/30 py-24">
          <div className="mx-auto w-full max-w-7xl px-4">
            <ShopTeaser />
          </div>
        </section>

        {/* Blog */}
        <section className="bg-gradient-to-b from-black/30 via-black/20 to-transparent py-24">
          <div className="mx-auto w-full max-w-7xl px-4">
            <BlogTeaser />
          </div>
        </section>

        {/* Mini Games */}
        <section className="bg-gradient-to-b from-transparent via-black/20 to-black/40 py-24">
          <div className="mx-auto w-full max-w-7xl px-4">
            <MiniGameTeaser />
          </div>
        </section>

        {/* Soapstones */}
        <section className="bg-gradient-to-b from-black/40 to-black/60 py-24">
          <div className="mx-auto w-full max-w-7xl px-4">
            <StickySoapstones />
          </div>
        </section>
      </div>

      {/* Existing drift animation layer if you want to keep it */}
      <SoapstoneHomeDrift />
    </div>
  );
}
