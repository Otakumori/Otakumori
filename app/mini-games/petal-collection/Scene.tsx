"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getAsset } from "../_shared/assets-resolver";
import { play } from "../_shared/audio-bus";
import "../_shared/cohesion.css";

const ROUND_MS = 60_000;
const EMIT_EVERY_MS = 220;              // emission cadence
const WIND_BASE = 0.06;                 // base wind strength
const WIND_VARIANCE = 0.04;
const GRAVITY = 0.045;                  // petal fall accel
const FLOOR_BAND = 24;                  // pixels for "pile" visual
const CATCHER_W_RATIO = 0.16;           // width of catcher relative to W
const CATCHER_H = 18;

type Petal = {
  id:number;
  x:number; y:number;
  vx:number; vy:number;
  rot:number; vr:number;
  r:number;    // render size multiplier
  alive:boolean;
};

export default function PetalCollection(){
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);

  // assets
  const bgUrl = getAsset("petal-collection","bg") ?? "";
  const petalUrl = getAsset("petal-collection","petalParticle") ?? "";
  const sCollect = getAsset("petal-collection","collectSfx") ?? "";
  const sMiss = getAsset("petal-collection","missSfx") ?? "";

  const bgImg = useMemo(()=>{ const im=new Image(); if (bgUrl) im.src = bgUrl; return im; },[bgUrl]);
  const petalImg = useMemo(()=>{ const im=new Image(); if (petalUrl) im.src = petalUrl; return im; },[petalUrl]);

  useEffect(()=>{
    const host = hostRef.current!, c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio||1, 2);

    // sizing
    let W=1280,H=720;
    function resize(){
      const r = host.getBoundingClientRect();
      W = Math.max(320, Math.round(r.width));
      H = Math.max(180, Math.round(r.height));
      c.width = Math.round(W*dpr); c.height = Math.round(H*dpr);
      c.style.width = `${W}px`; c.style.height = `${H}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      // adjust catcher on resize
      catcher.x = Math.min(catcher.x, W - catcher.w/2);
    }
    resize(); window.addEventListener("resize", resize);

    // game state
    const petals: Petal[] = [];
    let nextId = 1;
    let lastEmit = 0, startAt = 0, endAt = 0;
    let score = 0, streak = 0, mult = 1;
    let missCount = 0, caught = 0;

    const catcher = { x: W*0.5, w: W*CATCHER_W_RATIO };

    // input
    function onPointer(e:PointerEvent){
      const rect = c.getBoundingClientRect();
      const x = e.clientX - rect.left;
      catcher.x = Math.max(catcher.w/2, Math.min(W - catcher.w/2, x));
      if (!started){
        setStarted(true);
        startAt = performance.now();
        endAt = startAt + ROUND_MS;
      }
    }
    c.addEventListener("pointerdown", onPointer);
    c.addEventListener("pointermove", onPointer);

    // spawn from tree crown region (top center)
    function emit(now:number){
      const crownW = W*0.45;
      const x = W/2 + (Math.random()-0.5)*crownW;
      const y = H*0.08 + Math.random()*H*0.04;
      const wind = WIND_BASE + (Math.sin(now/1400) * WIND_VARIANCE);
      const vx = (Math.random()-0.5)*0.25 + wind;
      const vy = (Math.random()*0.2);
      const r = 0.7 + Math.random()*0.8;
      const rot = Math.random()*Math.PI*2;
      const vr = (Math.random()*0.06 - 0.03);
      petals.push({ id: nextId++, x, y, vx, vy, rot, vr, r, alive: true });
    }

    // pile reservoir at bottom (for "gathering" look)
    const pileHeights = new Float32Array(64); // 64 columns
    function pileIndex(x:number){ return Math.max(0, Math.min(63, Math.floor((x/W)*64))); }

    function update(now:number, dt:number){
      // spawn
      if (started && now - lastEmit > EMIT_EVERY_MS){
        emit(now);
        lastEmit = now;
      }

      // update petals
      for (const p of petals){
        if (!p.alive) continue;
        p.vy += GRAVITY*dt;
        // subtle wind drift
        const wind = WIND_BASE + (Math.sin((now + p.id*123)/1200) * WIND_VARIANCE);
        p.vx += (wind - 0.04)*0.001*dt;
        p.x += p.vx*dt*16;
        p.y += p.vy*dt*16;
        p.rot += p.vr*dt*16;

        // catcher collision (simple AABB)
        const cx = catcher.x, cy = H - FLOOR_BAND - CATCHER_H;
        const halfW = catcher.w/2, halfH = CATCHER_H/2;
        if (p.y > cy - halfH && p.y < cy + halfH && p.x > cx - halfW && p.x < cx + halfW){
          p.alive = false;
          caught++;
          streak++;
          mult = Math.min(5, 1 + Math.floor(streak/10)); // +1 every 10 streak, max x5
          score += 10 * mult;
          if (sCollect) play(sCollect, -10);
          // spill to pile
          const idx = pileIndex(p.x);
          pileHeights[idx] = Math.min(FLOOR_BAND-2, pileHeights[idx] + 2);
          continue;
        }

        // missed → hits floor band
        if (p.y >= H - FLOOR_BAND){
          p.alive = false;
          missCount++;
          streak = 0; mult = 1;
          if (sMiss) play(sMiss, -14);
          const idx = pileIndex(p.x);
          pileHeights[idx] = Math.min(FLOOR_BAND-2, pileHeights[idx] + 1.2);
        }
      }
    }

    function draw(now:number){
      // bg
      if (bgImg.complete && bgImg.naturalWidth){
        const s = Math.max(W/bgImg.naturalWidth, H/bgImg.naturalHeight);
        const iw = bgImg.naturalWidth*s, ih = bgImg.naturalHeight*s;
        ctx.globalAlpha = 0.92;
        ctx.drawImage(bgImg, (W-iw)/2, (H-ih)/2, iw, ih);
        ctx.globalAlpha = 1;
      } else {
        const g = ctx.createLinearGradient(0,0,0,H);
        g.addColorStop(0,"#0d0a0f"); g.addColorStop(1,"#181322");
        ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      }

      // tree mask hint (optional — visual crown)
      ctx.fillStyle = "rgba(255,183,197,0.05)";
      ctx.beginPath();
      ctx.ellipse(W/2, H*0.12, W*0.26, H*0.08, 0, 0, Math.PI*2);
      ctx.fill();

      // petals
      for (const p of petals){
        if (!p.alive) continue;
        const size = Math.min(W,H) * 0.025 * p.r;
        if (petalImg.complete){
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = 0.95;
          ctx.drawImage(petalImg, -size/2, -size/2, size, size);
          ctx.restore();
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = "rgba(255,183,197,0.9)";
          ctx.beginPath(); ctx.ellipse(0,0,size*0.45,size*0.3,0,0,Math.PI*2); ctx.fill();
          ctx.restore();
        }
      }

      // bottom pile band
      const bandY = H - FLOOR_BAND;
      ctx.fillStyle = "rgba(255,183,197,0.13)";
      ctx.fillRect(0, bandY, W, FLOOR_BAND);
      // draw pile as columns
      ctx.fillStyle = "rgba(255,183,197,0.28)";
      for (let i=0;i<64;i++){
        const colW = W/64;
        const h = pileHeights[i];
        if (h > 0) ctx.fillRect(i*colW, bandY + (FLOOR_BAND - h), colW, h);
      }

      // catcher
      const cx = catcher.x, cy = H - FLOOR_BAND - CATCHER_H;
      ctx.fillStyle = "rgba(255,183,197,0.22)";
      ctx.fillRect(cx - catcher.w/2, cy - CATCHER_H/2, catcher.w, CATCHER_H);
      ctx.strokeStyle = "rgba(255,183,197,0.45)";
      ctx.strokeRect(cx - catcher.w/2, cy - CATCHER_H/2, catcher.w, CATCHER_H);

      // HUD
      const remain = started ? Math.max(0, endAt - performance.now()) : ROUND_MS;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "600 16px ui-sans-serif, system-ui";
      ctx.fillText(`Score ${score}  x${mult}`, 12, 22);
      ctx.fillText(`Caught ${caught}`, 12, 44);
      ctx.fillText(`Time ${Math.ceil(remain/1000)}s`, 12, 66);

      // start hint
      if (!started){
        ctx.fillStyle = "rgba(255,183,197,0.95)";
        ctx.font = "700 22px ui-sans-serif, system-ui";
        const msg = "Tap or click to start • Drag to move";
        const mW = ctx.measureText(msg).width;
        ctx.fillText(msg, (W-mW)/2, H*0.52);
      }
    }

    // main loop
    let raf = 0, last = performance.now();
    function frame(now:number){
      const dt = Math.min(32, now-last); last = now;
      update(now, dt);
      // end?
      if (started && now >= endAt){
        end(now);
        return;
      }
      ctx.clearRect(0,0,W,H);
      draw(now);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    async function end(now:number){
      if (ended) return;
      setEnded(true);
      const duration = Math.round(Math.min(now - startAt, ROUND_MS));
      try{
        await fetch("/api/games/finish", {
          method:"POST", headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            game: "petal-collection",
            score,
            durationMs: duration,
            stats: { streakMax: mult>1 ? (mult-1)*10 : 0, misses: missCount, caught }
          })
        });
      } catch {}
      (window as any).__gameEnd?.({ score, durationMs: duration, stats: { streakMax: mult>1 ? (mult-1)*10 : 0, misses: missCount, caught } });
    }

    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      c.removeEventListener("pointerdown", onPointer);
      c.removeEventListener("pointermove", onPointer);
    };
  }, [bgUrl, petalUrl, sCollect, sMiss, started, ended]);

  return (
    <div ref={hostRef} className="absolute inset-0">
      <canvas ref={canvasRef} />
    </div>
  );
}
