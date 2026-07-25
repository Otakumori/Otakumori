'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { MoriAmbientPetals } from '@/app/components/mori';
import { resolveHomeScene } from './homeScene';

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);

    update();
    query.addEventListener('change', update);

    return () => query.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

export default function HeroScene() {
  const reducedMotion = usePrefersReducedMotion();
  const [scene, setScene] = useState(() => resolveHomeScene(new Date(), reducedMotion));
  const [imageSrc, setImageSrc] = useState(scene.asset.src);

  useEffect(() => {
    setScene(resolveHomeScene(new Date(), reducedMotion));

    const interval = window.setInterval(() => {
      setScene(resolveHomeScene(new Date(), reducedMotion));
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  useEffect(() => {
    setImageSrc(scene.asset.src);
  }, [scene.asset.src]);

  return (
    <div className="absolute inset-0 z-0 bg-[var(--mori-ink)]">
      <Image
        src={encodeURI(imageSrc)}
        alt={scene.asset.alt}
        fill
        priority
        unoptimized
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover opacity-95 transition-[opacity,filter,transform] duration-[1600ms] ease-out"
        onError={() => {
          if (imageSrc !== scene.asset.fallback) setImageSrc(scene.asset.fallback);
        }}
      />

      <div
        className="absolute inset-0 z-[3] transition-opacity duration-[2200ms]"
        style={{
          opacity: scene.motion.mistOpacity,
          background:
            'radial-gradient(circle at 30% 26%, rgba(245,234,216,0.24), transparent 34%), radial-gradient(circle at 78% 22%, rgba(201,133,146,0.22), transparent 30%), linear-gradient(to bottom, rgba(255,255,255,0.07), transparent 42%)',
        }}
      />
      <div
        className="absolute inset-0 z-[4] transition-opacity duration-[2200ms]"
        style={{
          opacity: scene.motion.glowOpacity,
          background:
            'radial-gradient(circle at 50% 38%, rgba(201,133,146,0.34), transparent 36%), radial-gradient(circle at 52% 62%, rgba(74,38,51,0.38), transparent 48%)',
        }}
      />
      <MoriAmbientPetals
        count={scene.motion.petalDensity}
        reduced={scene.motion.reducedMotion}
        className="z-[6]"
      />
      <div className="absolute inset-0 z-[7] bg-[radial-gradient(circle_at_center,transparent_36%,rgba(3,2,8,0.44)_78%),linear-gradient(to_bottom,rgba(5,3,10,0.12),rgba(5,3,10,0.46))]" />
    </div>
  );
}
