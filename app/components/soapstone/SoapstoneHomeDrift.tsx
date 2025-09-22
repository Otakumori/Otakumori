'use client';
import { useEffect, useState } from 'react';

type Item = { id: string; text: string };

export default function SoapstoneHomeDrift() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const h = (e: any) => {
      const text = e?.detail?.text as string;
      if (!text) return;
      // add a transient item
      setItems((prev) => [...prev, { id: Math.random().toString(36).slice(2), text }]);
      // auto-remove in ~10s
      setTimeout(() => setItems((prev) => prev.slice(1)), 10000);
    };
    document.addEventListener('soapstone:new', h);
    return () => document.removeEventListener('soapstone:new', h);
  }, []);

  // random positions near lower third, drifting upward slowly
  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {items.map((it, i) => {
        const left = 10 + Math.random() * 80; // %
        const bottom = 8 + Math.random() * 20; // %
        const delay = i * 0.05;
        return (
          <div
            key={it.id}
            style={{ left: `${left}%`, bottom: `${bottom}%`, animationDelay: `${delay}s` }}
            className="absolute select-none rounded-md border border-white/15 bg-black/70 px-3 py-2 text-sm text-zinc-100 backdrop-blur-md shadow-2xl animate-[rise_10s_ease-out_forwards]"
          >
            {it.text}
          </div>
        );
      })}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes rise {
            from {
              transform: translateY(0px);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            to {
              transform: translateY(-120px);
              opacity: 0;
            }
          }
        `,
        }}
      />
    </div>
  );
}
