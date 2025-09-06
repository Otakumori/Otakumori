'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

type Petal = { x: number; y: number; vx: number; vy: number; r: number; spin: number; alive: boolean; id: number };

const SPRITE_SRC = '/assets/images/petal.svg'; // your file

export default function PetalLayer() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = window.innerWidth, h = window.innerHeight, DPR = Math.min(window.devicePixelRatio || 1, 2);
    const fit = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    };
    fit();

    // Load petal sprite once
    const img = new Image();
    img.src = SPRITE_SRC;

    const anchor = document.getElementById('petal-spawn-anchor');
    const anchorRect = () => anchor?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 };

    let idSeq = 1;
    const petals: Petal[] = [];
    function spawn(n = 3) {
      const r = anchorRect();
      // bias spawn along the right side of the canopy box
      const bx = r.left + r.width * 0.65;
      const by = r.top + r.height * 0.25;
      for (let i = 0; i < n; i++) {
        petals.push({
          id: idSeq++,
          x: bx + (Math.random() * r.width * 0.4 - r.width * 0.2),
          y: by + (Math.random() * r.height * 0.4 - r.height * 0.2),
          vx: (Math.random() * 0.6 - 0.3),
          vy: (Math.random() * 0.4 + 0.6),
          r: Math.random() * Math.PI * 2,
          spin: (Math.random() * 0.02 - 0.01),
          alive: true
        });
      }
    }

    let last = performance.now(), raf = 0;
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)');
    const running = !pref.matches;

    const drawPetal = (p: Petal) => {
      const base = 14 * DPR; // sprite draw size
      const s = base * (0.85 + Math.random() * 0.3); // slight size variance

      ctx.save();
      ctx.translate(p.x * DPR, p.y * DPR);
      ctx.rotate(p.r);
      if (img.complete) {
        ctx.drawImage(img, -s * 0.5, -s * 0.5, s, s);
      } else {
        // safe fallback if sprite not yet loaded
        ctx.fillStyle = 'rgba(255,190,235,0.85)';
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.35);
        ctx.quadraticCurveTo(s * 0.6, -s * 0.2, 0, s * 0.8);
        ctx.quadraticCurveTo(-s * 0.6, -s * 0.2, 0, -s * 0.35);
        ctx.fill();
      }
      ctx.restore();
    };

    const step = (dt: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // gentle wind
      const wind = Math.sin(performance.now() / 3000) * 0.15;
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        if (!p.alive) continue;
        p.vx += wind * dt;
        p.vy += 0.12 * dt; // gravity
        p.x += p.vx * (60 * dt);
        p.y += p.vy * (60 * dt);
        p.r += p.spin;
        drawPetal(p);
        if (p.y > h + 40) p.alive = false;
      }
      // cleanup
      for (let i = petals.length - 1; i >= 0; i--) if (!petals[i].alive) petals.splice(i, 1);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      step(dt);
      raf = requestAnimationFrame(frame);
    };

    // spawn rhythm
    const spawnTimer = setInterval(() => spawn(2 + Math.floor(Math.random() * 3)), 1200);

    // click collect
    async function collectAt(x: number, y: number) {
      // find topmost petal near point
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        const dx = p.x - x, dy = p.y - y;
        if (dx * dx + dy * dy < 24 * 24) { // hit
          p.alive = false;
          try {
            const token = await getToken({ template: 'otakumori-jwt' });
            await fetch('/api/v1/petals/collect', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ source: 'tree', petalId: p.id }),
            });
          } catch {/* silent */}
          break;
        }
      }
    }

    const onClick = (e: MouseEvent) => collectAt(e.clientX, e.clientY);
    const onResize = () => fit();

    window.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    if (running) { last = performance.now(); raf = requestAnimationFrame(frame); }
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(spawnTimer);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
    };
  }, [getToken]);

  return <canvas ref={ref} aria-hidden className="fixed inset-0 -z-[4] h-screen w-screen pointer-events-none" />;
}