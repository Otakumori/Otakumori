'use client';
import { useEffect } from 'react';
type Density = 'home' | 'site';
type Vec = { x: number; y: number };

const AMBIENT_MS_HOME = 700;
const AMBIENT_MS_SITE = 2200;
const CLICK_BURST_COUNT = 16;
const FALL_MIN = 9000;
const FALL_MAX = 14000;

const rnd = (a: number, b: number) => Math.random() * (b - a) + a;

function spawnPetal(root: HTMLElement, start: Vec, z = 6) {
  const p = document.createElement('div');
  const size = rnd(5, 8);
  
  // 90s anime cherry blossom colors - matching tree's light pink with darker shadows
  // Cel-shaded radial gradient (hard color stops for 90s anime aesthetic)
  const lightPink = 'rgba(255, 192, 203, 0.95)'; // #FFC0CB - matches tree
  const lightPinkAlt = 'rgba(255, 182, 193, 0.9)'; // #FFB6C1 - slight variation
  const mediumPink = 'rgba(255, 160, 180, 0.85)'; // Softer medium
  const shadowPink = 'rgba(236, 72, 153, 0.6)'; // #EC4899 - darker shadow
  const deepShadow = 'rgba(219, 39, 119, 0.4)'; // #DB2777 - deepest shadow
  
  // Cel-shaded gradient with hard color stops (90s anime style)
  const gradient = `radial-gradient(circle at 30% 30%, ${lightPink} 0%, ${lightPinkAlt} 30%, ${mediumPink} 50%, ${shadowPink} 70%, ${deepShadow} 100%)`;
  
  // Petal shape using clip-path for individual cherry blossom petal
  const petalWidth = size;
  const petalHeight = size * 1.2;
  const clipPath = `polygon(
    50% 0%, 
    30% 20%, 
    15% 40%, 
    10% 60%, 
    15% 80%, 
    30% 95%, 
    50% 100%, 
    70% 95%, 
    85% 80%, 
    90% 60%, 
    85% 40%, 
    70% 20%
  )`;
  
  p.style.position = 'fixed';
  p.style.left = `${start.x}px`;
  p.style.top = `${start.y}px`;
  p.style.width = `${petalWidth}px`;
  p.style.height = `${petalHeight}px`;
  p.style.clipPath = clipPath;
  (p.style as any).WebkitClipPath = clipPath; // Safari support
  p.style.background = gradient;
  p.style.boxShadow = `0 0 ${size * 0.8}px rgba(219, 39, 119, 0.3), inset 0 0 ${size * 0.3}px rgba(255, 192, 203, 0.4)`;
  p.style.border = `0.5px solid rgba(219, 39, 119, 0.2)`;
  p.style.pointerEvents = 'none';
  p.style.zIndex = String(z);
  p.style.transform = 'translateZ(0)';
  p.style.willChange = 'transform, opacity';
  root.appendChild(p);

  // Gentle flow from tree - drift rightward (away from tree) with natural wobble
  const baseDriftX = rnd(60, 140); // More drift outward from tree
  const fallY = window.innerHeight + rnd(120, 260);
  const duration = rnd(FALL_MIN, FALL_MAX);
  const wobble = rnd(0.3, 0.7); // Gentler wobble for natural flow
  const startTs = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - startTs) / duration);
    // Drift rightward (away from tree) with gentle sine wave wobble
    const xOff = baseDriftX * t + Math.sin(t * Math.PI * 2 * wobble) * 30 * t;
    const yOff = t * fallY;
    const rot = t * 180 + Math.sin(t * 6.28) * 8; // Gentler rotation
    p.style.transform = `translate(${xOff}px, ${yOff}px) rotate(${rot}deg)`;
    p.style.opacity = String(1 - t * 0.95);
    t < 1 ? requestAnimationFrame(tick) : p.remove();
  };
  requestAnimationFrame(tick);
}

export default function CherryBlossomEffect({ density = 'home' }: { density?: Density }) {
  // Find tree position for canopy anchor - spawn from tree blossom area
  useEffect(() => {
    // Try to find tree element, or use default tree area (left side, top portion)
    const el = document.querySelector('[data-tree-root]') as HTMLDivElement | null;
    const root = document.body;
    const ms = density === 'home' ? AMBIENT_MS_HOME : AMBIENT_MS_SITE;

    // Default tree blossom area (left side, top 5-35% of viewport)
    let canopy: Vec = { x: 160, y: window.innerHeight * 0.15 };
    
    const setFromRect = () => {
      if (el) {
        const r = el.getBoundingClientRect();
        // Tree blossoms are in top portion, left side
        canopy = { x: r.left + r.width * 0.5, y: r.top + r.height * 0.15 };
      } else {
        // Fallback: left side, top portion where blossoms visually are
        const treeWidth = Math.min(420, window.innerWidth * 0.3);
        canopy = { 
          x: treeWidth * 0.4, // Within tree area
          y: window.innerHeight * 0.15 // Top portion where blossoms are
        };
      }
    };
    setFromRect();
    
    let ro: ResizeObserver | null = null;
    if (el) {
      ro = new ResizeObserver(setFromRect);
      ro.observe(el);
    }
    const onResize = () => setFromRect();
    addEventListener('resize', onResize);

    const id = setInterval(() => {
      const n = Math.round(rnd(1, density === 'home' ? 2 : 1));
      for (let i = 0; i < n; i++) {
        // Spawn with slight variation around tree blossom area
        const jx = rnd(-25, 25), // Slightly wider spread
          jy = rnd(-20, 20);
        spawnPetal(root, { x: canopy.x + jx, y: canopy.y + jy }, 6);
      }
    }, ms);

    // Only enable click interactions on home page
    const onClick = (e: MouseEvent) => {
      // Check if we're on the home page
      if (window.location.pathname !== '/') return;

      // Check if click is within exclusion zones around UI elements
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, textarea, select, [role="button"], [role="link"]')) {
        return;
      }

      // Check if click is near interactive elements (exclusion halo)
      const interactiveElements = document.querySelectorAll(
        'button, a, input, textarea, select, [role="button"], [role="link"]',
      );
      for (const element of interactiveElements) {
        const rect = element.getBoundingClientRect();
        const halo = 20; // 20px exclusion halo
        if (
          e.clientX >= rect.left - halo &&
          e.clientX <= rect.right + halo &&
          e.clientY >= rect.top - halo &&
          e.clientY <= rect.bottom + halo
        ) {
          return;
        }
      }

      const count = density === 'home' ? CLICK_BURST_COUNT : Math.round(CLICK_BURST_COUNT * 0.6);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const r = rnd(4, 22);
        spawnPetal(
          root,
          { x: e.clientX + Math.cos(angle) * r, y: e.clientY + Math.sin(angle) * r },
          9,
        );
      }
      // Dispatch petal collect event for HUD
      window.dispatchEvent(new Event('petal:collect'));
    };

    // Only add click listener on home page
    if (window.location.pathname === '/') {
      addEventListener('click', onClick, { passive: true });
    }

    return () => {
      clearInterval(id);
      if (window.location.pathname === '/') {
        removeEventListener('click', onClick);
      }
      removeEventListener('resize', onResize);
      if (ro) {
        ro.disconnect();
      }
    };
  }, [density]);

  return null;
}
