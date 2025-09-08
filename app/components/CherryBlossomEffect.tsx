"use client";
import { useEffect } from "react";
type Density = "home" | "site";
type Vec = { x: number; y: number };

const AMBIENT_MS_HOME = 700;
const AMBIENT_MS_SITE = 2200;
const CLICK_BURST_COUNT = 16;
const FALL_MIN = 9000;
const FALL_MAX = 14000;

const rnd = (a:number,b:number)=>Math.random()*(b-a)+a;

function spawnPetal(root: HTMLElement, start: Vec, z = 6) {
  const p = document.createElement("div");
  const size = rnd(5, 8);
  Object.assign(p.style, {
    position: "fixed",
    left: `${start.x}px`,
    top: `${start.y}px`,
    width: `${size}px`,
    height: `${size * 0.7}px`,
    borderRadius: `${size}px ${size}px ${size * 0.2}px ${size * 0.8}px`,
    background: "radial-gradient(40% 50% at 40% 50%, rgba(255,175,215,.95), rgba(250,130,190,.8))",
    boxShadow: "0 0 6px rgba(255,150,210,.25)",
    pointerEvents: "none",
    zIndex: String(z),
    transform: "translateZ(0)",
    willChange: "transform, opacity",
  } as CSSStyleDeclaration);
  root.appendChild(p);

  const driftX = rnd(40, 110);
  const fallY = window.innerHeight + rnd(120, 260);
  const duration = rnd(FALL_MIN, FALL_MAX);
  const wobble = rnd(0.4, 0.9);
  const startTs = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - startTs) / duration);
    const xOff = Math.sin(t * Math.PI * 2 * wobble) * driftX * t;
    const yOff = t * fallY;
    const rot = t * 220 + Math.sin(t * 6.28) * 10;
    p.style.transform = `translate(${xOff}px, ${yOff}px) rotate(${rot}deg)`;
    p.style.opacity = String(1 - t * 0.95);
    t < 1 ? requestAnimationFrame(tick) : p.remove();
  };
  requestAnimationFrame(tick);
}

export default function CherryBlossomEffect({ density = "home" }: { density?: Density }) {
  // Find tree position for canopy anchor
  useEffect(() => {
    const el = document.querySelector("[data-tree-root]") as HTMLDivElement | null;
    if (!el) return;
    const root = document.body;
    const ms = density === "home" ? AMBIENT_MS_HOME : AMBIENT_MS_SITE;

    let canopy: Vec = { x: 160, y: 140 };
    const setFromRect = () => {
      const r = el.getBoundingClientRect();
      canopy = { x: r.left + r.width * 0.66, y: r.top + r.height * 0.18 };
    };
    setFromRect();
    const ro = new ResizeObserver(setFromRect);
    ro.observe(el);
    const onResize = () => setFromRect();
    addEventListener("resize", onResize);

    const id = setInterval(() => {
      const n = Math.round(rnd(1, density === "home" ? 2 : 1));
      for (let i = 0; i < n; i++) {
        const jx = rnd(-18, 18), jy = rnd(-18, 18);
        spawnPetal(root, { x: canopy.x + jx, y: canopy.y + jy }, 6);
      }
    }, ms);

    const onClick = (e: MouseEvent) => {
      const count = density === "home" ? CLICK_BURST_COUNT : Math.round(CLICK_BURST_COUNT * 0.6);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const r = rnd(4, 22);
        spawnPetal(root, { x: e.clientX + Math.cos(angle) * r, y: e.clientY + Math.sin(angle) * r }, 9);
      }
      // Dispatch petal collect event for HUD
      window.dispatchEvent(new Event("petal:collect"));
    };
    addEventListener("click", onClick, { passive: true });

    return () => {
      clearInterval(id);
      removeEventListener("click", onClick);
      removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [density]);

  return null;
}