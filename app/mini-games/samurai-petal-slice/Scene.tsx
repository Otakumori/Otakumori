// DEPRECATED: This component is a duplicate. Use app\mini-games\bubble-ragdoll\Scene.tsx instead.
'use client';

import { useEffect, useRef, useState } from 'react';
import { getAsset } from '../_shared/assets-resolver';
import { play } from '../_shared/audio-bus';
import { useGameSave } from '../_shared/SaveSystem';
import { useGameAvatarData } from '../_shared/GameAvatarIntegration';
import '../_shared/cohesion.css';

// --- tunables (env/admin later) ---
const PETALS_START = 28;
const PETALS_MAX = 60;
const PETAL_SPEED = { min: 0.7, max: 1.7 }; // px/ms
const WIND_X = 0.05; // base drift
const CRIT_ANGLE = (22 * Math.PI) / 180; // slash ± deg for crit
const SLASH_LIFE = 220; // ms trail fade
const ROUND_TIME = 60_000; // 60 sec

type Petal = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  s: number;
  hit: boolean;
  glow: number;
};

type SlashPt = { x: number; y: number; t: number };

export default function SamuraiSlice() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { saveOnExit, autoSave, load } = useGameSave('samurai-petal-slice');
  const { avatarData, drawAvatar } = useGameAvatarData('samurai-petal-slice', 'default');
  const [over, setOver] = useState<null | {
    score: number;
    hits: number;
    crit: number;
    miss: number;
  }>(null);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const host = hostRef.current!,
      c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // assets via roles
    const bgUrl = getAsset('samurai-petal-slice', 'bg') ?? '';
    const petalUrl = getAsset('samurai-petal-slice', 'petalParticle') ?? '';
    const slashSfx = getAsset('samurai-petal-slice', 'slashSfx') ?? '';
    const hitSfx = getAsset('samurai-petal-slice', 'hitSfx') ?? '';
    const missSfx = getAsset('samurai-petal-slice', 'missSfx') ?? '';

    const bgImg = new Image();
    if (bgUrl) bgImg.src = bgUrl;
    const petalImg = new Image();
    if (petalUrl) petalImg.src = petalUrl;

    let W = 800,
      H = 480;
    let running = true;

    function resize() {
      const r = host.getBoundingClientRect();
      W = Math.max(320, Math.round(r.width));
      H = Math.max(180, Math.round(r.height)); // will be 16:9 by shell
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      c.style.width = `${W}px`;
      c.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // game state
    const petals: Petal[] = [];
    let nextId = 1;
    let last = performance.now();
    const trail: SlashPt[] = []; // recent pointer positions
    let pointerDown = false;
    let score = 0;
    let hits = 0;
    let miss = 0;
    let crit = 0;
    const endAt = performance.now() + ROUND_TIME;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    // Load previous high score
    load()
      .then((saveData) => {
        if (saveData?.stats?.highScore) {
          setHighScore(saveData.stats.highScore);
        }
      })
      .catch(() => {
        // Ignore loading errors
      });

    // spawn petals
    function spawn(n: number) {
      for (let i = 0; i < n && petals.length < PETALS_MAX; i++) {
        const s = 0.8 + Math.random() * 0.8;
        petals.push({
          id: nextId++,
          x: Math.random() * W,
          y: -24,
          vx: (Math.random() - 0.5) * 0.06 + WIND_X,
          vy: PETAL_SPEED.min + Math.random() * (PETAL_SPEED.max - PETAL_SPEED.min),
          r: Math.random() * Math.PI * 2,
          s,
          hit: false,
          glow: 0,
        });
      }
    }
    spawn(PETALS_START);

    // pointer input
    function onDown(e: PointerEvent) {
      pointerDown = true;
      addPt(e);
    }
    function onMove(e: PointerEvent) {
      if (!pointerDown) return;
      addPt(e);
    }
    function onUp() {
      pointerDown = false;
      trail.length = 0;
    }
    function addPt(e: PointerEvent) {
      const rect = c.getBoundingClientRect();
      trail.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() });
      if (trail.length > 40) trail.shift();
      if (slashSfx) play(slashSfx, -8);
    }
    c.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    function pruneTrail(now: number) {
      // keep only last SLASH_LIFE ms
      for (let i = trail.length - 1; i >= 0; i--) {
        if (now - trail[i].t > SLASH_LIFE) trail.splice(i, 1);
      }
    }

    // simple spatial grid to speed intersections
    function checkIntersections() {
      if (trail.length < 2) return;
      const a = trail[trail.length - 2],
        b = trail[trail.length - 1];
      const dx = b.x - a.x,
        dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      if (len < 6) return; // too short

      const angle = Math.atan2(dy, dx); // slash angle
      let anyHit = false,
        anyCrit = false;

      // Only check for hits if there are slashable petals visible
      const visiblePetals = petals.filter((p) => !p.hit && p.y >= -20 && p.y <= H + 20);

      for (const p of visiblePetals) {
        // distance from petal to segment ab < radius
        const r = 12 * p.s;
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (len * len)));
        const px = a.x + t * dx,
          py = a.y + t * dy;
        const d2 = (px - p.x) * (px - p.x) + (py - p.y) * (py - p.y);
        if (d2 <= r * r) {
          p.hit = true;
          p.glow = 1; // burst
          anyHit = true;
          // crit if near horizontal (katana arc vibe)
          const horiz = Math.abs(angle);
          const near = Math.min(horiz, Math.abs(Math.PI - horiz));
          const isCrit = near < CRIT_ANGLE;
          if (isCrit) {
            score += 25;
            crit++;
            anyCrit = true;
          } else {
            score += 10;
          }
          hits++;
          if (hitSfx) play(hitSfx, -6);

          // Auto-save progress every 10 hits
          if (hits % 10 === 0) {
            autoSave({
              score,
              level: 1,
              progress: (ROUND_TIME - (endAt - performance.now())) / ROUND_TIME,
              stats: { hits, crit, miss, highScore: Math.max(score, highScore) },
            }).catch(() => {
              // Ignore save errors during gameplay
            });
          }
        }
      }

      // Only count as miss if there were visible petals to hit but player missed them all
      if (!anyHit && visiblePetals.length > 0 && len > 15) {
        // require minimum slash length
        if (missSfx && Math.random() < 0.35) play(missSfx, -12);
        miss++;
      }

      // small camera shake / flash could go here (kept subtle)
      void anyCrit; // reserved
    }

    function update(now: number, dt: number) {
      pruneTrail(now);
      if (pointerDown) checkIntersections();

      // petals drift
      const wind = WIND_X + Math.sin(now * 0.0012) * 0.05;
      const grav = reduced ? 0.6 : 1.0;
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        if (p.hit) {
          p.y -= 0.06 * dt;
          p.r += 0.02 * dt;
          p.glow -= 0.02 * dt;
          if (p.glow <= 0) petals.splice(i, 1);
          continue;
        }
        p.x += (p.vx + wind) * dt;
        p.y += p.vy * grav * dt;
        p.r += 0.0015 * dt;
        if (p.y > H + 30 || p.x < -30 || p.x > W + 30) {
          // recycle
          petals.splice(i, 1);
        }
      }
      if (petals.length < PETALS_START) spawn(1);
    }

    function draw(now: number) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Use dirty rectangle optimization
      import('@/app/lib/canvas-rendering-optimizer').then(({ canvasOptimizer }) => {
        const dirtyRegions = canvasOptimizer.getDirtyRegions();

        if (dirtyRegions.length > 0) {
          // Only clear dirty regions
          dirtyRegions.forEach((region) => {
            ctx.clearRect(region.x, region.y, region.width, region.height);
          });
        } else {
          // Fallback to full clear if no dirty regions
          ctx.clearRect(0, 0, W, H);
        }
      });
      // bg
      if (bgImg.complete && bgImg.naturalWidth > 0) {
        const s = Math.max(W / bgImg.naturalWidth, H / bgImg.naturalHeight);
        const iw = bgImg.naturalWidth * s,
          ih = bgImg.naturalHeight * s;
        ctx.drawImage(bgImg, (W - iw) / 2, (H - ih) / 2, iw, ih);
      } else {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#0e0c11');
        g.addColorStop(1, '#1a1321');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      // petals
      for (const p of petals) {
        const w = 18 * p.s,
          h = 12 * p.s;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        if (p.glow > 0) {
          // burst aura
          ctx.shadowBlur = 18 * p.glow;
          ctx.shadowColor = 'rgba(255,170,190,0.9)';
        }
        if (petalImg.complete) ctx.drawImage(petalImg, -w / 2, -h / 3, w, h);
        else {
          ctx.fillStyle = '#ffb7c5';
          ctx.fillRect(-w / 2, -h / 2, w, h);
        }
        ctx.restore();
      }

      // slash trail (additive)
      if (trail.length >= 2) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 1; i < trail.length; i++) {
          const a = trail[i - 1],
            b = trail[i];
          const age = (now - b.t) / SLASH_LIFE;
          if (age > 1) continue;
          ctx.strokeStyle = `rgba(255,170,190,${Math.max(0, 1 - age)})`;
          ctx.lineWidth = 6 * (1 - age);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Avatar rendering
      if (avatarData) {
        // Draw avatar in top-right corner
        drawAvatar(ctx, W - 80, 20, 60, 60, 0);
      }

      // UI: timer & score
      const remain = Math.max(0, endAt - now);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '600 16px ui-sans-serif, system-ui';
      ctx.fillText(`Score ${score}`, 14, 24);
      ctx.fillText(`Time ${Math.ceil(remain / 1000)}s`, 14, 46);
    }

    // loop
    let raf = 0;
    function loop(now: number) {
      // Check if game should still be running (cleanup may have been called)
      if (!running) {
        return;
      }

      const dt = Math.min(32, now - last);
      last = now;
      update(now, dt);
      draw(now);
      if (now >= endAt) {
        end();
        return;
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    async function end() {
      const finalHighScore = Math.max(score, highScore);
      setOver({ score, hits, crit, miss });
      setHighScore(finalHighScore);

      // Save final game state
      try {
        await saveOnExit({
          score,
          level: 1,
          progress: 1.0, // Game completed
          stats: {
            hits,
            crit,
            miss,
            highScore: finalHighScore,
            gamesPlayed: (highScore > 0 ? 1 : 0) + 1,
            lastPlayed: Date.now(),
          },
        });
      } catch (error) {
        console.error('Failed to save game on exit:', error);
      }

      // Also send to legacy endpoint for compatibility
      try {
        await fetch('/api/games/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game: 'samurai-petal-slice',
            score,
            durationMs: ROUND_TIME,
            stats: { hits, crit, miss, highScore: finalHighScore },
          }),
        });
      } catch {}
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      c.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div ref={hostRef} className="gc-viewport mg-crt mg-tint relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full touch-none select-none" />
      {over && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-2xl border border-pink-300/40 bg-black/60 px-6 py-4 text-pink-100">
            <div className="text-xl font-semibold">Samurai Petal Slice</div>
            <div className="mt-2 text-pink-200/90">Score: {over.score}</div>
            <div className="text-pink-200/70">
              Hits: {over.hits} • Crit: {over.crit} • Miss: {over.miss}
            </div>
            <a
              href="/mini-games"
              className="mt-3 inline-block rounded-xl border border-pink-300/40 px-3 py-2 hover:bg-pink-300/10"
            >
              Back to hub
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
