'use client';

import { useEffect, useRef } from 'react';

/**
 * Petals only spawn on pixels of the tree image (alpha>0),
 * drift with wind, and settle on a ground band inside the container.
 * Click on a petal => award progress and remove it.
 */
export default function PetalEmitterTree({
  treeSrc = '/assets/ui/tree-sakura.svg',
  petalSrc = '/assets/ui/petal.svg',
  spawnPerSec = 22,
  windBase = 0.55, // average wind
  maxPetals = 140, // perf cap
  onCollect, // optional callback
  className = '',
}: {
  treeSrc?: string;
  petalSrc?: string;
  spawnPerSec?: number;
  windBase?: number;
  maxPetals?: number;
  onCollect?: () => Promise<void> | void;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // images
    const treeImg = new Image();
    treeImg.src = treeSrc;
    const petalImg = new Image();
    petalImg.src = petalSrc;

    // offscreen for tree alpha sampling
    const off = document.createElement('canvas');
    const octx = off.getContext('2d')!;

    // state
    let W = 1,
      H = 1,
      groundY = 1; // groundY: where petals settle
    let running = true;
    let last = performance.now();
    let spawnAcc = 0;
    let pointerDown = false;
    let px = 0,
      py = 0;

    // Use optimized particle system
    let particleSystem: any = null;
    import('@/app/lib/optimized-particle-system').then(({ particleSystem: ps }) => {
      particleSystem = ps;
      particleSystem.setViewport(0, 0, W, H);
    });

    // Petals array for fallback
    const petals: Petal[] = [];

    // prefers-reduced-motion -> reduce spawn
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SPAWN = prefersReducedMotion ? Math.max(6, spawnPerSec * 0.4) : spawnPerSec;

    type Petal = {
      id: number;
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      r: number;
      vr: number; // rotation
      s: number; // scale
      settled: boolean;
      life: number;
      maxLife: number;
    };

    let pid = 1;

    function resize() {
      const r = wrap.getBoundingClientRect();
      W = Math.max(320, r.width);
      H = Math.max(240, r.height);
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      c.style.width = `${W}px`;
      c.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // tree for alpha sampling
      off.width = W;
      off.height = H;
      if (treeImg.complete && treeImg.naturalWidth > 0) {
        octx.clearRect(0, 0, W, H);
        const scale = Math.min(W / treeImg.naturalWidth, H / treeImg.naturalHeight);
        const tw = treeImg.naturalWidth * scale;
        const th = treeImg.naturalHeight * scale;
        const tx = (W - tw) / 2;
        const ty = H - th; // anchor to bottom
        octx.drawImage(treeImg, tx, ty, tw, th);
        // define ground band: bottom 8–12% of the drawn tree area
        groundY = ty + th * 0.88;
      }
    }

    const onReady = () => resize();
    treeImg.onload = onReady;
    petalImg.onload = onReady;
    resize();
    window.addEventListener('resize', resize);

    // ResizeObserver for better resize handling
    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);

    // utilities
    function noise(t: number) {
      return Math.sin(t * 0.7) * 0.5 + Math.sin(t * 1.4 + 1.7) * 0.3;
    }

    function canopyPoint(): { x: number; y: number } {
      // try up to 40 times to hit non-transparent tree pixel
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * W;
        const y = Math.random() * (H * 0.9);
        const a = octx.getImageData(x, y, 1, 1).data[3];
        if (a > 10) return { x, y };
      }
      return { x: W * (0.3 + Math.random() * 0.4), y: H * 0.35 };
    }

    function spawn(n: number) {
      for (let i = 0; i < n && petals.length < maxPetals; i++) {
        const p0 = canopyPoint();
        const z = Math.random(); // fake depth
        const particle = {
          id: pid++,
          x: p0.x + (Math.random() * 12 - 6),
          y: p0.y + (Math.random() * 12 - 6),
          z,
          vx: 0.15 + 0.65 * z,
          vy: 0.18 + 0.55 * z,
          r: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.6,
          s: 0.55 + 0.7 * z,
          settled: false,
          life: 0,
          maxLife: 10000,
        };

        // Add to optimized particle system if available
        if (particleSystem) {
          particleSystem.addParticle({
            x: particle.x,
            y: particle.y,
            z: particle.z,
            vx: particle.vx,
            vy: particle.vy,
            vz: 0,
            life: particle.life,
            maxLife: particle.maxLife,
            size: particle.s,
            rotation: particle.r,
            rotationSpeed: particle.vr,
            alpha: 1,
            color: '#ff69b4',
            layer: 0,
          });
        }

        petals.push(particle);
      }
    }

    // hit test (simple box per petal)
    function hitPetal(x: number, y: number): number | null {
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        const w = 18 * p.s,
          h = 12 * p.s;
        if (x > p.x - w / 2 && x < p.x + w / 2 && y > p.y - h / 2 && y < p.y + h / 2) {
          return i;
        }
      }
      return null;
    }

    // pointer events
    const onPointerDown = (e: PointerEvent) => {
      pointerDown = true;
      const rect = c.getBoundingClientRect();
      px = e.clientX - rect.left;
      py = e.clientY - rect.top;
      const idx = hitPetal(px, py);
      if (idx !== null) collect(idx);
    };

    const onPointerUp = () => {
      pointerDown = false;
    };

    c.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    async function collect(idx: number) {
      const p = petals[idx];
      // pop effect: mark settled quickly; remove after
      petals.splice(idx, 1);
      try {
        await (onCollect ? onCollect() : fetch('/api/petals/click', { method: 'POST' }));
      } catch {}
    }

    // main loop
    let tNoise = 0;
    function tick(now: number) {
      if (!running) return;
      const dt = Math.min(32, now - last);
      last = now;
      tNoise += dt / 1000;

      // spawn pacing
      spawnAcc += dt;
      const want = (SPAWN * spawnAcc) / 1000;
      if (want >= 1) {
        spawn(Math.floor(want));
        spawnAcc -= (Math.floor(want) * 1000) / SPAWN;
      }

      // draw bg tree
      ctx.clearRect(0, 0, W, H);
      if (treeImg.complete && treeImg.naturalWidth > 0) {
        const scale = Math.min(W / treeImg.naturalWidth, H / treeImg.naturalHeight);
        const tw = treeImg.naturalWidth * scale;
        const th = treeImg.naturalHeight * scale;
        const tx = (W - tw) / 2;
        const ty = H - th;
        ctx.drawImage(treeImg, tx, ty, tw, th);
      }

      const gust = windBase + noise(tNoise) * 0.6;

      // Use optimized particle system if available
      if (particleSystem) {
        particleSystem.update(dt);
        const visibleParticles = particleSystem.getVisibleParticles();

        // Update viewport
        particleSystem.setViewport(0, 0, W, H);

        // Draw visible particles
        visibleParticles.forEach((p: any) => {
          if (petalImg.complete) {
            const wPet = 18 * p.size,
              hPet = 12 * p.size;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.alpha;
            ctx.drawImage(petalImg, -wPet / 2, -hPet / 2, wPet, hPet);
            ctx.restore();
          }
        });
      } else {
        // Fallback to original particle logic
        for (let i = 0; i < petals.length; i++) {
          const p = petals[i];
          if (!p.settled) {
            p.life += dt;
            p.x += (p.vx + gust) * dt * 0.04 + Math.sin((p.y + p.life) * 0.01) * 0.22;
            p.y += p.vy * dt * 0.05;
            // settle when reaching ground band
            if (p.y >= groundY - 6) {
              p.y = groundY - 6 + Math.random() * 2;
              p.vx *= 0.2;
              p.vy = 0;
              p.vr *= 0.2;
              p.settled = true;
            }
          } else {
            // gentle slide along ground to create a pile that looks fluid
            p.x += gust * 0.02 + Math.sin((p.id + tNoise) * 1.7) * 0.1;
          }

          // draw opaque petal (no global fade)
          if (petalImg.complete) {
            const wPet = 18 * p.s,
              hPet = 12 * p.s;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.r);
            ctx.drawImage(petalImg, -wPet / 2, -hPet / 2, wPet, hPet);
            ctx.restore();
          }
        }
      }

      requestAnimationFrame(tick);
    }

    const raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      c.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);

      // Clean up ResizeObserver
      if (ro) {
        ro.disconnect();
      }
    };
  }, [treeSrc, petalSrc, spawnPerSec, windBase, maxPetals, onCollect]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
    </div>
  );
}
