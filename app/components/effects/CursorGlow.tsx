"use client";
import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const last = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const el = dotRef.current!;
    const prm = window.matchMedia("(prefers-reduced-motion: reduce)");

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

    addEventListener("mousemove", onMove, { passive: true });
    return () => {
      removeEventListener("mousemove", onMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[15] h-6 w-6 rounded-full"
      style={{
        background:
          "radial-gradient(12px 12px at 50% 50%, rgba(244,114,182,0.28), rgba(244,114,182,0.0))",
        filter: "blur(2px)",
        transition: "transform 40ms linear",
        willChange: "transform",
        mixBlendMode: "screen",
      }}
    />
  );
}
