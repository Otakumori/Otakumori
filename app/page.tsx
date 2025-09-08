import HomeTree from './components/background/HomeTree';
import CherryBlossomEffect from './components/CherryBlossomEffect';
import HeroIntro from './components/HeroIntro';
import ShopTeaser from './components/ShopTeaser';
import BlogTeaser from './components/BlogTeaser';
import MiniGameTeaser from './components/MiniGameTeaser';
import StickySoapstones from './components/StickySoapstones';
import SoapstoneHomeDrift from './components/soapstone/SoapstoneHomeDrift';

export default function HomePage() {
  return (
    <>
      {/* Fixed tree and petals (home only) */}
      <HomeTree />
      <CherryBlossomEffect density="home" />

      {/* Foreground content */}
      <HeroIntro />
      <ShopTeaser />
      <BlogTeaser />
      <MiniGameTeaser />
      <section className="py-12">
        <StickySoapstones />
      </section>
      
      {/* Soapstone drift animation */}
      <SoapstoneHomeDrift />
    </>
  );
}
