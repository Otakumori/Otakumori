'use client';
import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let x = window.innerWidth / 2,
      y = window.innerHeight / 2,
      tx = x,
      ty = y;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const step = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      el.style.transform = `translate3d(${x - 150}px, ${y - 150}px,0)`;
      requestAnimationFrame(step);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    const id = requestAnimationFrame(step);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[4] h-[300px] w-[300px] rounded-full opacity-25 blur-3xl
                 bg-[radial-gradient(closest-side,rgba(255,170,210,0.55),transparent_70%)]"
    />
  );
}
