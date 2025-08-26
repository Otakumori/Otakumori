/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { CherryTree } from './CherryTree';
import { PetalHUD } from './PetalHUD';
import { useEffect, useState } from 'react';

export function HeroShrine() {
  const [petals, setPetals] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  // Generate flowing petals
  useEffect(() => {
    const newPetals = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10
    }));
    setPetals(newPetals);
  }, []);

  return (
    <section
      id="hero-shrine"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16"
    >
      {/* Animated dark background with moving elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-otm-ink to-otm-gray">
        {/* Moving grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,79,163,0.1)_1px,transparent_0)] bg-[length:50px_50px] animate-pulse-slow" />
        </div>
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0">
          <div className="absolute left-10 top-20 h-32 w-32 animate-float rounded-full bg-otm-pink/10 blur-xl" />
          <div className="absolute right-20 top-40 h-24 w-24 animate-float rounded-full bg-otm-rose/10 blur-xl" style={{ animationDelay: '2s' }} />
          <div className="absolute left-1/3 bottom-1/4 h-20 w-20 animate-float rounded-full bg-otm-pink/5 blur-lg" style={{ animationDelay: '4s' }} />
          <div className="absolute right-1/3 top-1/3 h-16 w-16 animate-float rounded-full bg-otm-rose/5 blur-lg" style={{ animationDelay: '6s' }} />
        </div>
      </div>

      {/* Flowing cherry blossom petals */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute pointer-events-none animate-float"
          style={{
            left: `${petal.x}%`,
            top: `${petal.y}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: '8s'
          }}
        >
          <img 
            src="/assets/images/petal1.png" 
            alt="Cherry blossom petal"
            className="w-8 h-8 opacity-60"
          />
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
        {/* Cherry Tree with PS2 Overlay */}
        <div className="mb-8 relative">
          <div className="relative">
            {/* Cherry Tree Image */}
            <img
              src="/assets/images/CherryTree.png"
              alt="Cherry Blossom Tree"
              className="mx-auto max-w-2xl h-auto drop-shadow-2xl"
            />
            
            {/* PS2 Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-otm-pink/20 mix-blend-overlay" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,79,163,0.1)_0%,transparent_70%)]" />
            
            {/* Scan lines effect */}
            <div className="absolute inset-0 opacity-30">
              <div className="h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,79,163,0.1)_2px,rgba(255,79,163,0.1)_4px)]" />
            </div>
          </div>
        </div>

        {/* Hero text */}
        <div className="mb-12">
          <h1 className="mb-6 bg-gradient-to-r from-otm-pink via-otm-rose to-purple-400 bg-clip-text text-6xl font-bold text-transparent md:text-8xl drop-shadow-2xl animate-fade-in">
            Otaku-mori
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-200 md:text-2xl animate-fade-in-up">
            Where cherry blossoms meet pixel art. Collect petals, unlock runes, and build your
            digital shrine in this PS2-inspired digital realm.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up">
            <button className="transform rounded-full bg-gradient-to-r from-otm-pink to-otm-rose px-8 py-4 font-semibold text-white shadow-otm-glow transition-all duration-200 hover:scale-105 hover:shadow-otm-glow-strong">
              Shop Now
            </button>
            <button className="rounded-full border-2 border-otm-pink/50 px-8 py-4 font-semibold text-otm-pink transition-all duration-200 hover:bg-otm-pink/10 hover:border-otm-pink">
              Play Mini-Games
            </button>
          </div>
        </div>

        {/* Petal HUD */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform">
          <PetalHUD 
            petalCount={0}
            guestPetalCount={0}
            guestCap={50}
            isGuest={true}
          />
        </div>
      </div>

      {/* Additional atmospheric effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle glow around the tree */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-otm-pink/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
