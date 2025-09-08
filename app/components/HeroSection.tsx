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
          <h1 className="mb-4 text-center text-4xl font-extrabold text-white drop-shadow-lg md:text-6xl">{<>''
            <span role='img' aria-label='emoji'>W</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>o</span>' '<span role='img' aria-label='emoji'>O</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>k</span><span role='img' aria-label='emoji'>u</span>-<span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>i</span>
            ''</>}</h1>
          <p className="mb-6 max-w-2xl text-center text-lg text-pink-100 md:text-2xl">{<>''
            <span role='img' aria-label='emoji'>T</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>e</span>-<span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>y</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>d</span>' '<span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>d</span>' '<span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>y</span>' '<span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>b</span>' '<span role='img' aria-label='emoji'>f</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span>' '<span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>e</span>,' '<span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>g</span>,' '<span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>d</span>' '<span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>p</span>-<span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span>
            <span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>s</span>.
            ''</>}</p>
        </div>
      </div>
    </section>
  );
}
