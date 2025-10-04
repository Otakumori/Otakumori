'use client';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface DynamicTreeProps {
  className?: string;
  season?: Season;
  nightMode?: boolean;
  parallax?: boolean;
  priority?: boolean;
}

function getSeasonByMonth(m: number): Season {
  // 0-based month
  if ([2, 3, 4].includes(m)) return 'spring';
  if ([5, 6, 7].includes(m)) return 'summer';
  if ([8, 9, 10].includes(m)) return 'autumn';
  return 'winter';
}

function isNight(hour: number) {
  return hour < 6 || hour >= 20;
}

export default function DynamicTree({
  className,
  season,
  nightMode,
  parallax = true,
  priority,
}: DynamicTreeProps) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const ref = useRef<HTMLDivElement>(null);

  // decide season + night
  const now = new Date();
  const chosenSeason = season ?? getSeasonByMonth(now.getMonth());
  const isNightNow = nightMode ?? isNight(now.getHours());

  const src = useMemo(() => {
    const base = `/trees/tree-${chosenSeason}${isNightNow ? '-night' : ''}.webp`;
    return base;
  }, [chosenSeason, isNightNow]);

  useEffect(() => {
    if (!parallax || !ref.current) return;
    const el = ref.current;
    function onMove(e: MouseEvent) {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      setMouse({ x, y });
    }
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [parallax]);

  // subtle transform
  const translateX = (mouse.x - 0.5) * 12; // px
  const translateY = (mouse.y - 0.5) * 6;

  return (
    <div
      ref={ref}
      className={cn(
        'relative isolate overflow-hidden rounded-2xl ring-1 ring-white/5 bg-card',
        'aspect-[16/9] w-full',
        className,
      )}
      aria-label={`Seasonal cherry tree: ${chosenSeason}${isNightNow ? ' night' : ''}`}
    >
      {/* gradient ambient */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light',
          isNightNow
            ? 'bg-gradient-to-b from-[#0b1020] to-transparent'
            : 'bg-gradient-to-b from-[#ffe1f0] to-transparent',
        )}
      />
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 1024px"
        className="object-cover"
        style={{
          transform: parallax ? `translate3d(${translateX}px, ${translateY}px, 0)` : undefined,
          transition: 'transform 120ms ease',
        }}
      />
      {/* petals overlay (soft) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-10 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
        <div className="absolute bottom-10 right-6 h-20 w-20 rounded-full bg-primary/20 blur-2xl" />
      </div>
    </div>
  );
}
