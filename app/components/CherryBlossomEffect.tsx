// app/components/CherryBlossomEffect.tsx
'use client';

import { useEffect, useRef } from 'react';

type Vec = { x: number; y: number };

const AMBIENT_INTERVAL_MS = 700; // slow + casual
const AMBIENT_MIN = 1;
const AMBIENT_MAX = 2;
const CLICK_BURST_COUNT = 16; // satisfying but not heavy
const FALL_TIME_MS_MIN = 9000; // dreamy slow
const FALL_TIME_MS_MAX = 14000;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function makePetal(root: HTMLElement, start: Vec, zIndex = 6) {
  const p = document.createElement('div');
  const size = rand(5, 8);
  p.className = 'om-petal';
  Object.assign(p.style, {
    position: 'fixed',
    left: `${start.x}px`,
    top: `${start.y}px`,
    width: `${size}px`,
    height: `${size * 0.7}px`,
    borderRadius: `${size}px ${size}px ${size * 0.2}px ${size * 0.8}px`,
    background: 'radial-gradient(40% 50% at 40% 50%, rgba(255,175,215,.95), rgba(250,130,190,.8))',
    boxShadow: '0 0 6px rgba(255,150,210,.25)',
    pointerEvents: 'none',
    zIndex: String(zIndex),
    transform: 'translateZ(0)',
    willChange: 'transform, opacity',
  } as CSSStyleDeclaration);
  root.appendChild(p);

  const driftX = rand(40, 110);
  const fallY = window.innerHeight + rand(120, 260);
  const duration = rand(FALL_TIME_MS_MIN, FALL_TIME_MS_MAX);
  const wobble = rand(0.4, 0.9);

  const startTs = performance.now();
  let raf = 0;

  const tick = (now: number) => {
    const t = Math.min(1, (now - startTs) / duration);
    const xOff = Math.sin(t * Math.PI * 2 * wobble) * driftX * t;
    const yOff = t * fallY;
    const rot = t * 220 + Math.sin(t * 6.28) * 10;
    p.style.transform = `translate(${xOff}px, ${yOff}px) rotate(${rot}deg)`;
    p.style.opacity = String(1 - t * 0.95);
    if (t < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      p.remove();
      cancelAnimationFrame(raf);
    }
  };

  requestAnimationFrame(tick);
}

export default function CherryBlossomEffect() {
  const originRef = useRef<Vec>({ x: 160, y: 140 });

  // Track canopy position (top-right cluster) as petal origin
  useEffect(() => {
    const el = document.querySelector('[data-tree-root]') as HTMLDivElement | null;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      originRef.current = {
        x: r.left + r.width * 0.66,
        y: r.top + r.height * 0.18,
      };
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  // Ambient gentle spawn
  useEffect(() => {
    const root = document.body;
    const timer = setInterval(() => {
      const n = Math.round(rand(AMBIENT_MIN, AMBIENT_MAX));
      for (let i = 0; i < n; i++) {
        const jitterX = rand(-18, 18);
        const jitterY = rand(-18, 18);
        makePetal(
          root,
          {
            x: originRef.current.x + jitterX,
            y: originRef.current.y + jitterY,
          },
          6,
        );
      }
    }, AMBIENT_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  // Click burst near cursor
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const root = document.body;
      for (let i = 0; i < CLICK_BURST_COUNT; i++) {
        const angle = (i / CLICK_BURST_COUNT) * Math.PI * 2;
        const radius = rand(4, 22);
        makePetal(
          root,
          {
            x: e.clientX + Math.cos(angle) * radius,
            y: e.clientY + Math.sin(angle) * radius,
          },
          9,
        );
      }
    };
    window.addEventListener('click', handler, { passive: true });
    return () => window.removeEventListener('click', handler);
  }, []);

  return null;
}
