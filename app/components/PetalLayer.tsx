'use client';
import { useEffect, useRef } from 'react';

type PetalProps = {
  mode?: 'interactive' | 'gentle'; // gentle = no click/drag; slower spawn/fall
  density?: number; // 0..1 (ambient amount)
};

const SRC = '/assets/images/petal.svg';

export default function PetalLayer({ mode = 'gentle', density = 0.4 }: PetalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const petals: HTMLImageElement[] = [];
    const spawn = (x: number, y: number, size = 16, baseYVel = 40) => {
      const img = new Image();
      img.src = SRC;
      img.alt = '';
      img.width = size;
      img.style.cssText = `position:absolute;left:${x - size / 2}px;top:${y - size / 2}px;opacity:.95;pointer-events:auto;filter:drop-shadow(0 2px 2px rgba(0,0,0,.25));transition:transform .25s ease,opacity .25s ease;will-change:transform,top,left`;
      c.appendChild(img);
      petals.push(img);
      const start = performance.now();
      let raf = 0;
      const sway = 8 + Math.random() * 10;
      const spin = 30 + Math.random() * 50;
      const tick = (t: number) => {
        const dt = (t - start) / 1000;
        const dy = baseYVel * dt; // slower than before
        const dx = Math.sin((t + Math.random() * 200) / 850) * 0.9; // gentler sway
        img.style.top = `${y + dy}px`;
        img.style.left = `${x + dx}px`;
        img.style.transform = `rotate(${(t / spin) % 360}deg)`;
        if (parseFloat(img.style.top) > innerHeight + 100) {
          img.remove();
          cancelAnimationFrame(raf);
        } else raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      if (mode === 'interactive') {
        img.addEventListener('click', () => {
          img.style.transform = 'scale(1.6) rotate(18deg)';
          img.style.opacity = '0';
          setTimeout(() => img.remove(), 220);
        });
      }
    };

    // ambient drift
    const ambient = () => {
      const amount = Math.max(1, Math.floor(6 * density)); // fewer by default
      for (let i = 0; i < amount; i++) {
        spawn(Math.random() * innerWidth, -40, 14 + Math.random() * 6, 38 + Math.random() * 10);
      }
    };
    ambient();
    const timer = setInterval(() => ambient(), 1600); // calmer cadence

    // optional interactive trail
    let down = false;
    const onDown = (e: MouseEvent) => {
      if (mode !== 'interactive') return;
      down = true;
      spawn(e.clientX, e.clientY, 18, 48);
    };
    const onMove = (e: MouseEvent) => {
      if (mode !== 'interactive' || !down) return;
      spawn(e.clientX, e.clientY, 16, 48);
    };
    const onUp = () => {
      down = false;
    };

    if (mode === 'interactive') {
      addEventListener('mousedown', onDown);
      addEventListener('mousemove', onMove);
      addEventListener('mouseup', onUp);
    }

    return () => {
      clearInterval(timer);
      if (mode === 'interactive') {
        removeEventListener('mousedown', onDown);
        removeEventListener('mousemove', onMove);
        removeEventListener('mouseup', onUp);
      }
      petals.forEach((p) => p.remove());
    };
  }, [mode, density]);

  return <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}
