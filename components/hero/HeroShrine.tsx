'use client';

import { useEffect, useState } from 'react';

export function HeroShrine() {
  const [_petals, _setPetals] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);

  // Generate flowing petals
  useEffect(() => {
    const newPetals = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10,
    }));
    setPetals(newPetals);
  }, []);

  return (
    <section
      id="hero-shrine"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16"
    >
      {/* Use the universal space background - no additional background needed */}

      {/* Petals are handled by PetalLayer component */}

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
        {/* Tree is handled by HomeTreeWind component */}

        {/* Minimal hero text - no CTAs, no HUD */}
        <div className="mb-12">
          <h1 className="mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-300 bg-clip-text text-6xl font-bold text-transparent md:text-8xl drop-shadow-2xl">
            Otaku-mori
          </h1>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-white md:text-2xl">
            Where cherry blossoms meet pixel art. Collect petals, unlock runes, and build your
            digital shrine in this PS2-inspired digital realm.
          </p>
        </div>
      </div>
    </section>
  );
}
