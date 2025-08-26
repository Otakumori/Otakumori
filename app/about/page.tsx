/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import type React from 'react';

export default function AboutMe() {
  return (
    <main className="relative mx-auto max-w-4xl px-6 py-16 text-pink-100">
      {/* Petal field background (decorative) */}
      <PetalField />

      {/* Hero Manifesto (short, candid) */}
      <section className="relative z-10">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-pink-300 drop-shadow-sm select-none">
          About Me (Manifesto Mode)
        </h1>
        <div className="group inline-block">
          <p
            className="mb-4 text-lg leading-relaxed will-change-transform transition-[filter,transform,color] duration-500 ease-out text-pink-100/95 hover:text-pink-200/95 group-hover:[text-shadow:0_0_24px_rgba(251,182,206,.45)]"
            style={{ animation: 'breathe 6s ease-in-out infinite' }}
          >
            I didn’t “wake up one day and decide to code.” No. I staggered into it like an NPC
            wandering too far from its spawn point. Imagine: late-night shifts, instant noodles,
            college stress, and me thinking, <span className="italic">“What if I just built a whole website?”</span>
            Spoiler: I had no coding skills. Like, zero.
          </p>
          <p
            className="text-lg leading-relaxed will-change-transform transition-[filter,transform,color] duration-500 ease-out text-pink-100/95 hover:text-pink-200/95 group-hover:[text-shadow:0_0_24px_rgba(251,182,206,.45)]"
            style={{ animation: 'breathe 6s ease-in-out infinite 1.2s' }}
          >
            But I got stubborn. Stubborn like replaying a boss fight fifty times because I refuse to lower the difficulty.
            Fueled by anime openings, caffeine, and spite, I brute-forced my way here. So this site? It’s not crafted by a
            <span className="italic"> developer</span>. It’s built by a chaotic student, overnight worker, and
            imagination gremlin who thought websites should feel alive again.
          </p>
        </div>
      </section>

      {/* Hero Statement (single line callout) */}
      <section className="relative z-10 my-16 text-center select-none">
        <p
          className="text-2xl font-extrabold tracking-wide text-pink-400 drop-shadow-lg transition-colors duration-500 hover:text-pink-300"
          style={{ animation: 'breathe 7s ease-in-out infinite 0.6s' }}
        >
          This world was built with &lt;3, ramen stains, and sheer stubbornness.
        </p>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-20 border-t border-pink-300/20 pt-6 text-sm text-pink-300/60">
        <p>Built with stubbornness and anime marathons.</p>
        <p>
          Contact: <a href="mailto:adi@otaku-mori.com" className="underline">adi@otaku-mori.com</a>
        </p>
        <p className="mt-2">Credits at bottom for all assets and sounds. Respect to the creators.</p>
      </footer>

      {/* Local styles for subtle floating + petals */}
      <style jsx>{`
        @keyframes breathe { 0%{ transform: translateY(0); } 50%{ transform: translateY(-6px); } 100%{ transform: translateY(0); } }
        @keyframes floatDown { 0%{ transform: translateY(-10vh) rotate(0deg); opacity: 0; } 10%{ opacity: .9; } 100%{ transform: translateY(110vh) rotate(180deg); opacity: 0; } }
        @keyframes sway { 0%{ transform: translateX(0); } 50%{ transform: translateX(16px); } 100%{ transform: translateX(0); } }
        .petal { position:absolute; top:-10vh; width:14px; height:10px; border-radius: 60% 40% 60% 40% / 60% 40% 60% 40%;
                 background: radial-gradient(ellipse at 40% 40%, rgba(255,214,232,.95), rgba(251,182,206,.85) 60%, rgba(251,182,206,.0) 70%);
                 box-shadow: 0 0 12px rgba(251,182,206,.35);
                 animation: floatDown linear var(--dur, 14s) var(--delay, 0s) both, sway ease-in-out 4.8s infinite;
                 filter: saturate(1.1) hue-rotate(-6deg) contrast(1.02);
               }
        /* hover glow subtlety on the whole section */
        .group:hover p { filter: drop-shadow(0 0 12px rgba(251,182,206,.28)); }
      `}</style>
    </main>
  );
}

/** Decorative Sakura Petal Field (no interaction). */
function PetalField(){
  // Render N petals with varied positions/timings. Adjust count as needed.
  const petals = Array.from({ length: 18 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      {petals.map((_, i) => {
        const left = Math.floor(Math.random()*100);
        const delay = (i % 9) * 0.9 + (i*0.13);
        const dur = 12 + (i % 6) * 1.2;
        const style: React.CSSProperties = {
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${dur}s`,
          // small variety in size
          width: `${12 + (i % 5) * 2}px`,
          height: `${9 + (i % 5) * 1.5}px`,
          opacity: 0.9 - (i % 5) * 0.12
        };
        return <span key={i} className="petal" style={style} />;
      })}
    </div>
  );
}
