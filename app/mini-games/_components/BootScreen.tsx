'use client';
import { useEffect, useState } from 'react';

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ms = prefersReduced ? 800 : 2600;
    const t = setTimeout(() => {
      try {
        // handled by caller as daily gate
      } catch {}
      onDone();
    }, ms);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="relative isolate z-0 h-[min(90vh,100svh)] w-full overflow-hidden bg-black grid place-items-center">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes dropIn {
          0% {
            transform: translateY(-120px) scale(0.7);
          }
          60% {
            transform: translateY(0) scale(1.05);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
        @keyframes orbit {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        `,
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-pink-200">Otakumori</div>
          <div className="mt-1 text-xs text-pink-300/80">Booting Console…</div>
        </div>
      </div>
      <div className="relative h-40 w-40" style={{ animation: 'dropIn 900ms ease-out' as any }}>
        <div className="absolute inset-0 rounded-full border-2 border-pink-500/30" />
        <div className="absolute inset-3 rounded-full border border-pink-400/40" />
        <div className="absolute inset-0 animate-[orbit_2200ms_linear_infinite]">
          {[0, 90, 180, 270].map((deg) => (
            <div
              key={deg}
              className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.6)]"
              style={{ transform: `rotate(${deg}deg) translateY(-64px)` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
