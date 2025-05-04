import Image from 'next/image'
import styles from './HeroSection.module.css'

export default function HeroSection() {
  return (
    <section className="relative w-full flex items-center justify-center min-h-[60vh] md:min-h-[70vh] overflow-hidden rounded-b-3xl shadow-xl">
      <Image
        src="/cherry-hero.svg"
        alt="Cherry Blossom Forest"
        fill
        priority
        className="object-cover object-center z-0"
      />
      {/* Petal Animation Overlay */}
      <div className={styles.petalOverlay} aria-hidden="true" />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4 text-center">
          Welcome to Otaku-mori
        </h1>
        <p className="text-lg md:text-2xl text-pink-100 max-w-2xl text-center mb-6">
          The ultimate e-commerce playground and community hub for anime, gaming, and pop-culture enthusiasts.
        </p>
      </div>
    </section>
  )
} 