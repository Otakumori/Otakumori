"use client";
import { useEffect, useState } from 'react';

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ms = prefersReduced ? 600 : 2200;
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem('om_boot_played', '1');
      } catch {}
      onDone();
    }, ms);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="relative isolate z-0 h-[min(90vh,100svh)] w-full overflow-hidden bg-black grid place-items-center">
      <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-pink-200">Otakumori</div>
          <div className="mt-1 text-xs text-pink-300/80">Preparing 3D…</div>
        </div>
      </div>
      {/* Minimal O-cube vibe: pulsing ring */}
      <div className="relative h-40 w-40">
        <div className="absolute inset-0 rounded-full border-4 border-pink-500/40 animate-ping" />
        <div className="absolute inset-4 rounded-full border-2 border-pink-400/60" />
      </div>
    </div>
  );
}

