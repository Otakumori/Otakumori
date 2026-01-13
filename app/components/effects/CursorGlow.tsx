'use client';
import { useEffect, useRef, useState } from 'react';

export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const last = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const el = dotRef.current!;
    const prm = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (rafId.current == null && !prm.matches) tick();
      else {
        el.style.transform = `translate(${target.current.x - 12}px, ${target.current.y - 12}px)`;
      }
    };

    const tick = () => {
      const k = 0.18;
      last.current.x += (target.current.x - last.current.x) * k;
      last.current.y += (target.current.y - last.current.y) * k;
      dotRef.current!.style.transform = `translate(${last.current.x - 12}px, ${last.current.y - 12}px)`;
      rafId.current = requestAnimationFrame(tick);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('a, button, [role="button"], [data-clickable]')) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    
    return () => {
      removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[15] h-6 w-6 rounded-full transition-opacity duration-300"
      style={{
        background: isHovering
          ? 'radial-gradient(12px 12px at 50% 50%, rgba(244,114,182,0.5), rgba(139,92,246,0.3), rgba(244,114,182,0.0))'
          : 'radial-gradient(12px 12px at 50% 50%, rgba(244,114,182,0.28), rgba(244,114,182,0.0))',
        filter: 'blur(2px)',
        transition: 'transform 40ms linear',
        willChange: 'transform',
        mixBlendMode: 'screen',
        opacity: isHovering ? 1 : 0.6,
      }}
    />
  );
}
