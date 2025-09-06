import Image from 'next/image';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className="flex items-center justify-center py-12">
      <div className="relative aspect-[2/1] w-full max-w-3xl overflow-hidden rounded-3xl shadow-xl">
        <Image
          src="/assets/cherry.jpg"
          alt="Cherry Blossom Tree"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Petal Animation Overlay */}
        <div className={styles.petalOverlay} aria-hidden="true" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <h1 className="mb-4 text-center text-4xl font-extrabold text-white drop-shadow-lg md:text-6xl">
            Welcome to Otaku-mori
          </h1>
          <p className="mb-6 max-w-2xl text-center text-lg text-pink-100 md:text-2xl">
            The ultimate e-commerce playground and community hub for anime, gaming, and pop-culture
            enthusiasts.
          </p>
        </div>
      </div>
    </section>
  );
}
