'use client';
import { useEffect, useRef } from 'react';

const SRC = '/assets/images/petal.svg';

export default function PetalLayer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const all: HTMLImageElement[] = [];

    const spawn = (x: number, y: number, size = 18) => {
      const img = new Image();
      img.src = SRC;
      img.alt = '';
      img.width = size;
      img.style.cssText = `position:absolute;left:${x - size / 2}px;top:${y - size / 2}px;opacity:.95;pointer-events:auto;filter:drop-shadow(0 2px 2px rgba(0,0,0,.25));transition:transform .25s ease,opacity .25s ease;will-change:transform,top,left`;
      c.appendChild(img);
      all.push(img);

      // drift + fall
      const start = performance.now();
      let raf = 0;
      const tick = (t: number) => {
        const dt = (t - start) / 1000,
          dy = 60 * dt,
          dx = Math.sin(t / 420) * 0.6;
        img.style.top = `${y + dy}px`;
        img.style.left = `${x + dx}px`;
        img.style.transform = `rotate(${(t / 50) % 360}deg)`;
        if (parseFloat(img.style.top) > innerHeight + 80) {
          img.remove();
          cancelAnimationFrame(raf);
        } else raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      img.addEventListener('click', () => {
        img.style.transform = 'scale(1.6) rotate(18deg)';
        img.style.opacity = '0';
        setTimeout(() => img.remove(), 220);
      });
    };

    if (!reduced) {
      // ambient
      for (let i = 0; i < 10; i++) spawn(Math.random() * innerWidth, -40, 14 + Math.random() * 10);
      const timer = setInterval(
        () => spawn(Math.random() * innerWidth, -40, 14 + Math.random() * 10),
        900,
      );

      // click/drag trail
      let down = false;
      const downH = (e: MouseEvent) => {
        down = true;
        spawn(e.clientX, e.clientY, 20);
      };
      const moveH = (e: MouseEvent) => {
        if (down) spawn(e.clientX, e.clientY, 16);
      };
      const upH = () => {
        down = false;
      };

      addEventListener('mousedown', downH);
      addEventListener('mousemove', moveH);
      addEventListener('mouseup', upH);

      return () => {
        clearInterval(timer);
        removeEventListener('mousedown', downH);
        removeEventListener('mousemove', moveH);
        removeEventListener('mouseup', upH);
        all.forEach((n) => n.remove());
      };
    }
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ overflow: 'hidden' }}
    />
  );
}
