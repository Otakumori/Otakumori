"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getAsset } from "../_shared/assets-resolver";
import { play } from "../_shared/audio-bus";
import { useAvatarForGame } from "../_shared/useAvatarForGame";
import "../_shared/cohesion.css";

const ROUND_MS = 60_000;
const MAX_BUBBLES = 24;
const SPAWN_EVERY_MS = 900; // spawn cadence
const GRAVITY = 0.0009;     // px/ms^2 in Verlet
const DRAG = 0.9992;        // gentle damping

type Bubble = { id:number; x:number; y:number; r:number; vy:number; popped:boolean; t:number };
type Pt = { x:number; y:number; px:number; py:number };       // Verlet point
type Stick = { a:number; b:number; len:number; stiff:number }; // constraint

export default function BubbleRagdoll(){
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ended, setEnded] = useState(false);

  // assets
  const bgUrl = getAsset("bubble-ragdoll","bg") ?? "";
  const bubbleSprite = getAsset("bubble-ragdoll","bubbleSprite") ?? "";
  const sPop = getAsset("bubble-ragdoll","popSfx") ?? "";
  const sBoing = getAsset("bubble-ragdoll","bounceSfx") ?? "";
  const sThud = getAsset("bubble-ragdoll","failSfx") ?? "";

  const bubbleImg = useMemo(()=>{ const im = new Image(); if (bubbleSprite) im.src = bubbleSprite; return im; },[bubbleSprite]);
  const bgImg = useMemo(()=>{ const im = new Image(); if (bgUrl) im.src = bgUrl; return im; },[bgUrl]);

  // avatar (if enabled)
  const { enabled: avatarEnabled, avatar } = useAvatarForGame(true);

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
    }
    resize(); window.addEventListener("resize", resize);

    // world
    const bubbles: Bubble[] = [];
    let nextId = 1; let lastSpawn = 0;
    let score = 0, combo = 0, bestCombo = 0, misses = 0;
    const startAt = performance.now(); const endAt = startAt + ROUND_MS;

    // ragdoll: 2-point torso + 1 head
    const pts: Pt[] = [];
    const sticks: Stick[] = [];
    function addPt(x:number,y:number): number { pts.push({ x, y, px:x, py:y }); return pts.length-1; }
    function addStick(a:number,b:number,stiff=1){ const dx=pts[b].x-pts[a].x, dy=pts[b].y-pts[a].y; sticks.push({ a,b, len: Math.hypot(dx,dy), stiff }); }
    const cx = W*0.5, cy = H*0.35, gap = Math.min(W,H)*0.06;
    const pTorsoTop = addPt(cx, cy-gap*0.6);
    const pTorsoBot = addPt(cx, cy+gap*0.6);
    const pHead     = addPt(cx, cy-gap*1.3);
    addStick(pTorsoTop, pTorsoBot, 0.9);
    addStick(pTorsoTop, pHead, 0.7);

    // input (pop and shove)
    function onPointerDown(e:PointerEvent){
      const rect = c.getBoundingClientRect();
      const x = e.clientX-rect.left, y = e.clientY-rect.top;
      // find nearest bubble within radius
      let hit = -1;
      for (let i=bubbles.length-1;i>=0;i--){
        const b=bubbles[i]; if (b.popped) continue;
        const d2 = (b.x-x)**2 + (b.y-y)**2;
        if (d2 < (b.r*1.05)**2){ hit = i; break; }
      }
      if (hit>=0){
        const b = bubbles[hit];
        b.popped = true;
        score += 100 + Math.floor(combo*7);
        combo = Math.min(99, combo+1); bestCombo = Math.max(bestCombo, combo);
        if (sPop) play(sPop, -6);
        // upward impulse to ragdoll if near
        const near = Math.hypot(pts[pTorsoBot].x - b.x, pts[pTorsoBot].y - b.y);
        if (near < b.r*2){
          const pt = pts[pTorsoBot];
          const j = Math.max(0.5, 1.6 - near/(b.r*2)); // weaker if further
          const vy = (pt.y - pt.py);
          pt.py = pt.y - (vy - j*8); // kick upward
          if (sBoing) play(sBoing, -12);
        }
      } else {
        // small lateral shove on avatar
        const pt = pts[pTorsoTop];
        pt.px -= (x-pt.x)*0.02;
        pt.py -= (y-pt.y)*0.02;
        misses++;
      }
    }
    c.addEventListener("pointerdown", onPointerDown);

    // bubble spawner
    function spawnBubble(){
      const r = Math.max(20, Math.min(60, (Math.random()**0.6)*60));
      const x = Math.random()*(W - 2*r) + r;
      const y = H + r + 6;
      const vy = -(0.05 + Math.random()*0.08); // rises upward
      bubbles.push({ id: nextId++, x, y, r, vy, popped:false, t: performance.now() });
    }

    // physics
    function verletIntegrate(dt:number){
      for (const p of pts){
        const vx = (p.x - p.px) * DRAG;
        const vy = (p.y - p.py) * DRAG + GRAVITY*dt*dt;
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy;
      }
      // constraints solve
      for (let k=0;k<3;k++){
        for (const s of sticks){
          const a = pts[s.a], b = pts[s.b];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx,dy) || 0.0001;
          const diff = (dist - s.len)/dist * s.stiff;
          const ox = dx*0.5*diff, oy = dy*0.5*diff;
          a.x += ox; a.y += oy;
          b.x -= ox; b.y -= oy;
        }
        // floor/walls
        for (const p of pts){
          if (p.x < 0) p.x = 0;
          if (p.x > W) p.x = W;
          if (p.y < 0) p.y = 0;
          if (p.y > H-6){ p.y = H-6; if (sThud) play(sThud, -18); }
        }
      }
    }

    // bubble collisions with ragdoll (torso only)
    function collide(){
      const torso = [pts[pTorsoTop], pts[pTorsoBot]];
      for (const b of bubbles){
        if (b.popped) continue;
        // bubble vs bottom of torso
        for (const t of torso){
          const dx = t.x - b.x, dy = t.y - b.y;
          const dist = Math.hypot(dx,dy);
          const r = b.r + 18; // torso radius ~18
          if (dist < r && dist>0){
            // push apart
            const pen = (r - dist);
            const nx = dx/dist, ny = dy/dist;
            t.x += nx*pen*0.5;
            t.y += ny*pen*0.5;
            b.x -= nx*pen*0.3;
            b.y -= ny*pen*0.3;
            // buoyancy: gently nudge up
            t.py += 0.8;
            if (sBoing && Math.random()<0.07) play(sBoing, -18);
          }
        }
      }
    }

    // draw helpers
    function drawBG(){
      if (bgImg.complete && bgImg.naturalWidth>0){
        const s = Math.max(W/bgImg.naturalWidth, H/bgImg.naturalHeight);
        const iw = bgImg.naturalWidth*s, ih = bgImg.naturalHeight*s;
        ctx.globalAlpha = 0.9;
        ctx.drawImage(bgImg, (W-iw)/2, (H-ih)/2, iw, ih);
        ctx.globalAlpha = 1;
      } else {
        const g = ctx.createLinearGradient(0,0,0,H);
        g.addColorStop(0,"#090c12"); g.addColorStop(1,"#0f1520");
        ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      }
    }
    function drawBubbles(now:number){
      for (const b of bubbles){
        if (b.popped) continue;
        const age = (now - b.t)*0.001;
        // rise & sway
        b.y += b.vy * (16); // vy is per ms; scaled per frame chunk
        b.x += Math.sin(age*2 + b.id)*0.2;
        // cull if off top
        if (b.y + b.r < -10) b.popped = true;

        ctx.save();
        if (bubbleImg.complete) {
          const s = b.r*2;
          ctx.globalAlpha = 0.9;
          ctx.drawImage(bubbleImg, b.x-b.r, b.y-b.r, s, s);
          ctx.globalAlpha = 1;
        } else {
          const grd = ctx.createRadialGradient(b.x-4,b.y-6, b.r*0.2, b.x,b.y,b.r);
          grd.addColorStop(0,"rgba(255,255,255,0.45)");
          grd.addColorStop(1,"rgba(180,210,255,0.15)");
          ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
          ctx.strokeStyle = "rgba(200,220,255,0.4)"; ctx.stroke();
        }
        ctx.restore();
      }
    }
    function drawAvatar(){
      // torso path
      ctx.strokeStyle = "rgba(230,240,255,0.25)";
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(pts[pTorsoTop].x, pts[pTorsoTop].y); ctx.lineTo(pts[pTorsoBot].x, pts[pTorsoBot].y); ctx.stroke();

      // sprite billboard on torso if available
      if (avatarEnabled && avatar?.spriteUrl){
        const dx = pts[pTorsoBot].x - pts[pTorsoTop].x;
        const dy = pts[pTorsoBot].y - pts[pTorsoTop].y;
        const ang = Math.atan2(dy,dx)+Math.PI/2;
        const len = Math.hypot(dx,dy);
        const w = Math.max(48, len*1.6);
        const h = w*1.3;
        ctx.save();
        ctx.translate(pts[pTorsoTop].x, pts[pTorsoTop].y);
        ctx.rotate(ang);
        const img = new Image(); img.src = avatar.spriteUrl!;
        // (best practice: preload outside; simplified here)
        ctx.globalAlpha = 0.95;
        ctx.drawImage(img, -w/2, -h*0.1, w, h);
        ctx.restore();
      } else {
        // neutral head/torso
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath(); ctx.arc(pts[pHead].x, pts[pHead].y, 10, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(pts[pTorsoBot].x, pts[pTorsoBot].y, 14, 0, Math.PI*2); ctx.fill();
      }
    }

    // main loop
    let raf = 0, last = performance.now();
    function loop(now:number){
      const dt = Math.min(32, now-last); last=now;

      if (now - lastSpawn > SPAWN_EVERY_MS && bubbles.length < MAX_BUBBLES){
        spawnBubble(); lastSpawn = now;
      }

      // physics & collisions
      verletIntegrate(dt);
      collide();

      // draw
      ctx.clearRect(0,0,W,H);
      drawBG();
      drawBubbles(now);
      drawAvatar();

      // HUD
      const remain = Math.max(0, endAt - now);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "600 16px ui-sans-serif, system-ui";
      ctx.fillText(`Score ${score}`, 12, 22);
      ctx.fillText(`Combo ${combo}`, 12, 44);
      ctx.fillText(`Time ${Math.ceil(remain/1000)}s`, 12, 66);

      // end conditions
      if (pts[pTorsoBot].y > H + 40 || now >= endAt){
        end(now);
        return;
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    async function end(now:number){
      if (ended) return; setEnded(true);
      const duration = Math.round(Math.min(now - startAt, ROUND_MS));
      try{
        await fetch("/api/games/finish", {
          method:"POST", headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            game: "bubble-ragdoll",
            score,
            durationMs: duration,
            stats: { combo: bestCombo, misses, pops: Math.floor(score/100) }
          })
        });
      } catch {}
      (window as any).__gameEnd?.({
        score, durationMs: duration, stats: { combo: bestCombo, misses, pops: Math.floor(score/100) }
      });
    }

    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      c.removeEventListener("pointerdown", onPointerDown);
    };
  }, [avatarEnabled, avatar?.spriteUrl, bgUrl, bubbleSprite, sPop, sBoing, sThud]);

  return (
    <div ref={hostRef} className="absolute inset-0">
      <canvas ref={canvasRef} />
    </div>
  );
}
