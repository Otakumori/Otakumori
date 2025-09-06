// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import NavBar from './components/NavBar';
import StarfieldPurple from './components/StarfieldPurple';
import TreeLeftAligned from './components/TreeLeft';
import PetalLayer from './components/PetalLayer';
import HeroIntro from './components/HeroIntro';
import ShopTeaser from './components/ShopTeaser';
import BlogTeaser from './components/BlogTeaser';
import MiniGameTeaser from './components/MiniGameTeaser';
import StickySoapstones from './components/StickySoapstones';
import FooterDark from './components/FooterDark';

export default function HomePage() {
  return (
    <>
      {/* Background layers (home only) */}
      <StarfieldPurple />
      <TreeLeftAligned src="/assets/images/cherry-tree@2x.webp" trunkCenterPx={380} />
      <PetalLayer />

      {/* Foreground */}
      <NavBar />
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
