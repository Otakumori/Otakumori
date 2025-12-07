'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import useWind from '@/app/hooks/useWind';
import { CANOPY_POINTS } from '../CherryTree';

interface Petal {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  spin: number;
  from: { x: number; y: number };
  interactive?: boolean;
  collected?: boolean;

const PETAL_LIMIT = { decor: 40, interactive: 12 };
const PETAL_IMG = '/assets/images/petal.svg';

function randomFromCanopy(treeRect: DOMRect) {
  const pt = CANOPY_POINTS[Math.floor(Math.random() * CANOPY_POINTS.length)];
  return {
    x: treeRect.left + pt.x * treeRect.width + (Math.random() - 0.5) * 16,
    y: treeRect.top + pt.y * treeRect.height + (Math.random() - 0.5) * 12,
  };
}

type PetalLayerProps = { variant: 'decor' | 'interactive' };

const PetalLayer: React.FC<PetalLayerProps> = ({ variant }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLElement | null>(null);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [wallet, setWallet] = useState(0);
  const wind = useWind();
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Find the tree DOM node for canopy mapping
  useEffect(() => {
    if (!containerRef.current) return;
    treeRef.current = document.querySelector('[data-tree-root], .cherry-tree-root');
  }, []);
  // Petal spawn/animation loop
  useEffect(() => {
    if (prefersReducedMotion) return;
    let running = true;
    let frame = 0;
    const animate = () => {
      if (!running) return;
      frame++;
      setPetals((prev) => {
        let next = prev
          .map((p) => {
            if (p.collected) return p;
            // Drift with wind
            const dx =
              wind.dirVec.x * (p.speed + wind.speed + wind.gust) +
              Math.sin(frame / 40 + p.id) * 0.2;
            const dy =
              0.5 + wind.dirVec.y * (p.speed + wind.speed) + Math.cos(frame / 60 + p.id) * 0.1;
            return { ...p, x: p.x + dx, y: p.y + dy, angle: p.angle + p.spin };
          })
          .filter(
            (p) =>
              !p.collected &&
              p.y < window.innerHeight + 40 &&
              p.x > -40 &&
              p.x < window.innerWidth + 40,
          );
        // Recycle if under limit
        if (next.length < PETAL_LIMIT[variant] && treeRef.current) {
          const treeRect = treeRef.current.getBoundingClientRect();
          next.push({
            id: Math.random(),
            ...randomFromCanopy(treeRect),
            angle: Math.random() * 360,
            speed: 0.5 + Math.random() * 0.7,
            spin: (Math.random() - 0.5) * 0.2,
            from: randomFromCanopy(treeRect),
            interactive: variant === 'interactive',
          });
        }
        return next;
      });
      requestAnimationFrame(animate);
    };
    animate();
    return () => {
      running = false;
    };
  }, [variant, wind, prefersReducedMotion]);
  // Reduced motion: static petals
  useEffect(() => {
    if (!prefersReducedMotion && petals.length) return;
    if (prefersReducedMotion && treeRef.current) {
      const treeRect = treeRef.current.getBoundingClientRect();
      setPetals(
        Array.from({ length: 6 }, (_, i) => ({
          id: i,
          ...randomFromCanopy(treeRect),
          angle: Math.random() * 360,
          speed: 0,
          spin: 0,
          from: randomFromCanopy(treeRect),
          interactive: false,
        })),
      );
    }
  }, [prefersReducedMotion]);
  // Click handler for interactive petals with hit-test safety
  const handleCollect = (id: number, ev: React.MouseEvent) => {
    // Don't preventDefault: let real links win if we're not topmost.
    const cx = ev.clientX;
    const cy = ev.clientY;

    // Who is actually on top under the pointer?
    const top = document.elementFromPoint(cx, cy);
    const el = ev.currentTarget as HTMLElement;

    // If a card/link/etc is on top, ignore so the click goes through.
    if (top !== el && !el.contains(top as Node)) return;

    // Otherwise collect
    setPetals((prev) => prev.map((p) => (p.id === id ? { ...p, collected: true } : p)));
    setWallet((w) => w + 1);
    // Optionally: dispatch event for analytics
    const evt = new CustomEvent('petal-collected', { detail: { id } });
    window.dispatchEvent(evt);
  };
  // Layer style
  const layerClass =
    variant === 'decor'
      ? 'fixed inset-0 z-20 pointer-events-none select-none'
      : 'absolute inset-0 z-30 pointer-events-auto select-none';
  return (
    <div ref={containerRef} className={layerClass} aria-hidden={variant === 'decor'}>
      {variant === 'interactive' && (
        <div className="sr-only" aria-live="polite">
          Wallet: {wallet}
        </div>
      )}
      {petals.map((p) => (
        <motion.img
          key={p.id}
          src={PETAL_IMG}
          alt=""
          initial={false}
          animate={{
            x: p.x,
            y: p.y,
            rotate: p.angle,
            opacity: p.collected ? 0 : 1,
            scale: p.collected ? 0.5 : 1,
          }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 32,
            height: 32,
            pointerEvents: p.interactive ? 'auto' : 'none',
            cursor: p.interactive ? 'pointer' : 'default',
            zIndex: 1,
          }}
          tabIndex={p.interactive ? 0 : -1}
          aria-label={p.interactive ? 'Collect petal' : undefined}
          onClick={p.interactive ? (e) => handleCollect(p.id, e) : undefined}
          onKeyDown={
            p.interactive
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const syntheticEvent = {
                      clientX: 0,
                      clientY: 0,
                      currentTarget: e.currentTarget,
                    } as unknown as React.MouseEvent;
                    handleCollect(p.id, syntheticEvent);
                  }
                }
              : undefined
          }
        />
      ))}
    </div>
  );
};

export default PetalLayer;
