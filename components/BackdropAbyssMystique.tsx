'use client';

import React, { useEffect } from 'react';

type Props = {
  tone?: number; // 0..1 intensity (default .42)
  speed?: number; // seconds; higher = slower (default 68)
  angle?: number; // degrees (default 28)
};

/**
 * Abyss Purple • Mystique background component
 * Fixed backdrop with animated layers: gradient sweep, pixel shimmer,
 * curtain aurora, halftone dots, bokeh orbs, and drifting stars
 * No parallax effects - pure CSS animations
 */
export default function BackdropAbyssMystique({ tone = 0.42, speed = 68, angle = 28 }: Props) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--om-base', '#1a1320'); // Abyss Purple
    root.style.setProperty('--om-tone', String(tone));
    root.style.setProperty('--om-speed', `${speed}s`);
    root.style.setProperty('--om-angle', `${angle}deg`);

    // Bokeh orbs - create 8 floating orbs
    const bokehLayer = document.querySelector('.om-layer.bokeh') as HTMLElement | null;
    if (bokehLayer && bokehLayer.childElementCount === 0) {
      for (let i = 0; i < 8; i++) {
        const orb = document.createElement('div');
        orb.className = 'orb';
        orb.style.left = `${Math.random() * 100}vw`;
        orb.style.top = `${Math.random() * 100}vh`;
        const scale = (0.6 + Math.random() * 0.8).toFixed(2);
        orb.style.transform = `translate3d(0,0,0) scale(${scale})`;
        orb.style.animationDelay = `${(Math.random() * -60).toFixed(2)}s`;
        bokehLayer.appendChild(orb);
      }
    }

    // Stars - create 80 twinkling stars with gentle drift
    const starLayer = document.querySelector('.om-layer.stars') as HTMLElement | null;
    if (starLayer && starLayer.childElementCount === 0) {
      const COUNT = 80;
      const DRIFT = 1.0;
      for (let i = 0; i < COUNT; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;

        // 12% chance for larger stars
        const isBig = Math.random() < 0.12;
        star.style.width = isBig ? '3px' : '2px';
        star.style.height = isBig ? '3px' : '2px';

        // Random drift direction and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = (60 + Math.random() * 80) * DRIFT; // 60–140px over duration
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance * -0.6; // slight upward bias
        star.style.setProperty('--om-dx', `${dx.toFixed(1)}px`);
        star.style.setProperty('--om-dy', `${dy.toFixed(1)}px`);

        // Random twinkle and drift timing
        const twinkleTime = 5 + Math.random() * 6; // 5–11s
        const driftTime = 90 + Math.random() * 80; // 90–170s
        star.style.setProperty('--om-tw', `${twinkleTime.toFixed(2)}s`);
        star.style.setProperty('--om-dd', `${driftTime.toFixed(2)}s`);

        star.style.animationDelay = `${(Math.random() * twinkleTime).toFixed(2)}s, ${(-Math.random() * driftTime).toFixed(2)}s`;
        starLayer.appendChild(star);
      }
    }
  }, [tone, speed, angle]);

  return (
    <>
      {/* Fixed, site-wide, no pointer events */}
      <div className="om-bg" aria-hidden />
      <div className="om-layer gradientSweep" aria-hidden />
      <div className="om-layer pixelShimmer" aria-hidden />
      <div className="om-layer curtainAurora" aria-hidden />
      <div className="om-layer halftoneDots" aria-hidden />
      <div className="om-layer bokeh" aria-hidden />
      <div className="om-layer stars" aria-hidden />

      <style jsx global>{`
        :root {
          --om-base: #1a1320;
          --om-tone: 0.42;
          --om-speed: 68s;
          --om-angle: 28deg;
        }

        /* Layers are fixed and behind everything */
        .om-bg,
        .om-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .om-bg {
          background: var(--om-base);
        }

        /* 1) Conic sweep - rotating gradient */
        .om-layer.gradientSweep {
          background: conic-gradient(
            from var(--om-angle),
            rgba(255, 255, 255, calc(0.06 * var(--om-tone))) 0 18%,
            transparent 35% 100%
          );
          mix-blend-mode: soft-light;
          animation: om-sweep var(--om-speed) linear infinite;
        }
        @keyframes om-sweep {
          to {
            transform: rotate(360deg);
          }
        }

        /* 2) Pixel shimmer - diagonal line pattern */
        .om-layer.pixelShimmer {
          background-image: repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, calc(0.05 * var(--om-tone))) 0 1px,
            transparent 1px 3px
          );
          mix-blend-mode: soft-light;
          animation: om-shimmer 10s linear infinite alternate;
        }
        @keyframes om-shimmer {
          to {
            transform: translate3d(4px, -4px, 0);
          }
        }

        /* 3) Curtain aurora - horizontal gradient bands */
        .om-layer.curtainAurora {
          background: linear-gradient(
            90deg,
            hsla(270, 100%, 80%, calc(0.1 * var(--om-tone))) 0 20%,
            transparent 40% 60%,
            hsla(320, 100%, 80%, calc(0.1 * var(--om-tone))) 80% 100%
          );
          filter: blur(8px);
          mix-blend-mode: soft-light;
          animation: om-curtain calc(var(--om-speed) * 1.8) ease-in-out infinite alternate;
        }
        @keyframes om-curtain {
          to {
            transform: translate3d(1%, 0, 0);
          }
        }

        /* 4) Halftone dots - dot pattern overlay */
        .om-layer.halftoneDots {
          background-image: radial-gradient(
            circle at 1px 1px,
            rgba(255, 255, 255, calc(0.06 * var(--om-tone))) 1px,
            transparent 1.6px
          );
          background-size: 6px 6px;
          mix-blend-mode: soft-light;
          animation: om-dots calc(var(--om-speed) * 1.6) linear infinite alternate;
        }
        @keyframes om-dots {
          to {
            transform: translate3d(1%, -1%, 0);
          }
        }

        /* 5) Bokeh orbs - floating circular elements */
        .om-layer.bokeh .orb {
          position: absolute;
          width: 22vmin;
          height: 22vmin;
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.12),
            rgba(255, 255, 255, 0) 60%
          );
          filter: blur(10px);
          mix-blend-mode: soft-light;
          opacity: calc(0.22 * var(--om-tone));
          animation: om-bokeh var(--om-speed) ease-in-out infinite alternate;
        }
        @keyframes om-bokeh {
          to {
            transform: translate3d(6vw, -4vh, 0) scale(1.05);
          }
        }

        /* 6) Stars - twinkling with gentle drift */
        .om-layer.stars {
          background: transparent;
          overflow: hidden;
        }
        .om-layer.stars .star {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: #fff;
          opacity: 0.35;
          filter: blur(0.4px);
          animation:
            om-twinkle var(--om-tw, 7s) ease-in-out infinite,
            om-drift var(--om-dd, 120s) linear infinite;
          will-change: transform, opacity;
        }
        @keyframes om-twinkle {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.65;
          }
        }
        @keyframes om-drift {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(var(--om-dx, 80px), var(--om-dy, -40px), 0);
          }
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .om-layer {
            animation: none !important;
          }
          .om-layer .orb,
          .om-layer .star {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
