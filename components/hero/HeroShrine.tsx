'use client';

import { CherryTree } from './CherryTree';
import { PetalHUD } from './PetalHUD';

export function HeroShrine() {
  return (
    <section
      id="hero-shrine"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-purple-50" />

      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-30 mix-blend-multiply">
        <div className="bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.4%22/%3E%3C/svg%3E')] absolute inset-0 opacity-20" />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        {/* Cherry Tree */}
        <div className="mb-8">
          <CherryTree />
        </div>

        {/* Hero text */}
        <div className="mb-12">
          <h1 className="mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-5xl font-bold text-transparent md:text-7xl">
            Otaku-mori
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-gray-700 md:text-2xl">
            Where cherry blossoms meet pixel art. Collect petals, unlock runes, and build your
            digital shrine.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="transform rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl">
              Shop Now
            </button>
            <button className="rounded-full border-2 border-purple-500 px-8 py-4 font-semibold text-purple-600 transition-colors duration-200 hover:bg-purple-50">
              Play Mini-Games
            </button>
          </div>
        </div>

        {/* Petal HUD */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform">
          <PetalHUD />
        </div>
      </div>

      {/* Subtle parallax effect */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-20 top-20 h-32 w-32 animate-pulse rounded-full bg-pink-200 opacity-20 blur-xl" />
        <div className="absolute bottom-40 right-20 h-24 w-24 animate-pulse rounded-full bg-purple-200 opacity-20 blur-xl delay-1000" />
      </div>
    </section>
  );
}
