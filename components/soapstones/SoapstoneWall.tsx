// components/soapstones/SoapstoneWall.tsx
'use client';

import { useEffect, useState } from 'react';

type Teaser = { id: string; teaser: string }; // teaser is hash/placeholder, not the full text
type FullMsg = { id: string; text: string };

export default function SoapstoneWall() {
  const [teasers, setTeasers] = useState<Teaser[]>([]);
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  useEffect(() => {
    // GET teasers only (no full text)
    fetch('/api/soapstones?mode=teasers')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setTeasers(data.items ?? []))
      .catch(() => setTeasers([]));
  }, []);

  async function reveal(id: string) {
    if (revealed[id]) return;
    const r = await fetch(`/api/soapstones/${id}`);
    if (!r.ok) return;
    const data: FullMsg = await r.json();
    setRevealed((s) => ({ ...s, [id]: data.text }));
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {teasers.map((t) => {
        const text = revealed[t.id];
        return (
          <button
            key={t.id}
            onClick={() => reveal(t.id)}
            aria-expanded={Boolean(text)}
            className="group text-left rounded-xl border border-white/10 bg-white/5 px-4 py-3
                       hover:bg-white/8 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {!text ? (
              <div className="h-12 overflow-hidden">
                <div className="h-full w-full blur-sm select-none text-pink-200/40">
                  {t.teaser /* hashed/placeholder, safe to render */}
                </div>
                <div className="mt-1 text-xs text-pink-200/60">Tap to reveal</div>
              </div>
            ) : (
              <div className="text-pink-100">{text}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
