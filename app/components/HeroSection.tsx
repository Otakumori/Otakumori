import Image from 'next/image'
import styles from './HeroSection.module.css'

export default function HeroSection() {
  return (
    <section className="flex justify-center items-center py-12">
      <div className="relative w-full max-w-3xl aspect-[2/1] rounded-3xl overflow-hidden shadow-xl">
        <Image
          src="/assets/cherry.jpg"
          alt="Cherry Blossom Tree"
          fill
          priority
          className="object-cover object-center"
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
      </div>
    </section>
  )
} 