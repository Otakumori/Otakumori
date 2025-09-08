"use client";
import { useEffect, useRef, useState } from "react";

/**
 * A thin top bar with subtle shimmering and occasional blossom flecks.
 * Progress is controlled via window events or fetch; here we just listen.
 * Dispatch: document.dispatchEvent(new CustomEvent("om:progress", { detail: 0..1 }))
 */
export default function PetalProgressBar() {
  const [p, setP] = useState(0);
  const raf = useRef(0);
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onProg = (e: any) => {
      const v = Math.max(0, Math.min(1, e.detail ?? 0));
      setP(v);
    };
    document.addEventListener("om:progress", onProg);
    return () => document.removeEventListener("om:progress", onProg);
  }, []);

  useEffect(() => {
    // shimmer animation via background-position
    const tick = () => {
      if (el.current) {
        const t = Date.now() / 6000;
        el.current.style.backgroundPosition = `${t * 100}% 0`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div className="fixed left-0 top-0 z-40 h-1 w-full bg-black/50">
      <div
        ref={el}
        className="h-full"
        style={{
          width: `${Math.round(p * 100)}%`,
          backgroundImage:
            "linear-gradient(90deg, rgba(219,39,119,0.9) 0%, rgba(219,39,119,0.6) 50%, rgba(219,39,119,0.9) 100%)",
          maskImage: "linear-gradient(90deg, black 60%, transparent 90%)",
        }}
      />
    </div>
  );
}
