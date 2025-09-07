import HomeTree from './components/background/HomeTree';
import CherryBlossomEffect from './components/CherryBlossomEffect';
import HeroIntro from './components/HeroIntro';
import ShopTeaser from './components/ShopTeaser';
import BlogTeaser from './components/BlogTeaser';
import MiniGameTeaser from './components/MiniGameTeaser';
import StickySoapstones from './components/StickySoapstones';
import FooterDark from './components/FooterDark';

export default function HomePage() {
  return (
    <>
      {/* Fixed tree and petals (home only) */}
      <HomeTree />
      <CherryBlossomEffect />

      {/* Foreground content */}
      <main className="relative z-10">
        <HeroIntro />
        <ShopTeaser />
        <BlogTeaser />
        <MiniGameTeaser />
        <section className="py-12">
          <StickySoapstones />
        </section>
      </main>
      <FooterDark />

      {/* extra bottom fade so tree roots blend on short pages */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 -z-[4] h-40 bg-gradient-to-b from-transparent to-[#080611]"
      />
    </>
  );
}
