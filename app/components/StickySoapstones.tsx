'use client';

import * as React from 'react';
import clsx from 'clsx';

type Sticky = {
  id: string;
  text: string;
  x: number;
  y: number;
  rot: number;
};

export default function StickySoapstones() {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState('');
  const [items, setItems] = React.useState<Sticky[]>([]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const placeRandom = React.useCallback((w = 260, h = 110) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();

    const pad = 16;
    const maxX = Math.max(0, rect.width - w - pad);
    const maxY = Math.max(0, rect.height - h - pad);
    const x = Math.floor(pad + Math.random() * (maxX - pad));
    const y = Math.floor(pad + Math.random() * (maxY - pad));
    return { x, y };
  }, []);

  function randomRot() {
    const r = Math.random() * 24 - 12; // -12°..+12°
    return Math.round(r * 10) / 10;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const { x, y } = placeRandom();
    const rot = randomRot();

    const optimistic: Sticky = {
      id: crypto.randomUUID(),
      text: trimmed,
      x,
      y,
      rot,
    };

    setItems((prev) => [optimistic, ...prev]);
    setText('');
    setOpen(false);

    // OPTIONAL PERSISTENCE:
    // If server action exists at app/(site)/actions/soapstone.ts
    // try { await createSoapstone({}, new FormData().set("text", trimmed)); } catch {}
  }

  return (
    <section className="relative">
      <div
        ref={containerRef}
        className="relative min-h-[150px] w-full rounded-2xl border border-zinc-800/50 bg-zinc-950/40 p-3"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-200">Leave a sign for fellow travelers</h3>

          {/* Small pink trigger button, white text */}
          <button
            onClick={() => setOpen((v) => !v)}
            className={clsx(
              'rounded-xl px-3 py-1.5 text-white transition',
              'bg-pink-600 hover:bg-pink-500 active:translate-y-[1px]',
              'text-sm',
            )}
            aria-expanded={open}
            aria-controls="soapstone-input"
          >
            Place Sign
          </button>
        </div>

        {/* Collapsible input */}
        <div
          id="soapstone-input"
          className={clsx(
            'overflow-hidden transition-[grid-template-rows,opacity] duration-300',
            open ? 'grid grid-rows-[1fr] opacity-100' : 'grid grid-rows-[0fr] opacity-0',
          )}
        >
          <form onSubmit={handleSubmit} className="min-h-0">
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 280))}
                placeholder="Compose a sign…"
                className="h-16 w-full resize-none rounded-xl bg-black/40 p-2 text-zinc-100 outline-none ring-1 ring-zinc-700 focus:ring-pink-500/60"
                maxLength={280}
              />
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                <span>{280 - text.length} left</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-2.5 py-1 hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-pink-600 px-3 py-1.5 text-white transition hover:bg-pink-500 disabled:opacity-40"
                    disabled={!text.trim()}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Stuck soapstones */}
        {items.map((m) => (
          <Soapstone key={m.id} text={m.text} x={m.x} y={m.y} rot={m.rot} />
        ))}
      </div>
    </section>
  );
}

function Soapstone({ text, x, y, rot }: { text: string; x: number; y: number; rot: number }) {
  const elRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (elRef.current) {
      elRef.current.style.setProperty('--entry-rot', `${rot}deg`);
    }
  }, [rot]);

  return (
    <div
      ref={elRef}
      className={clsx('soapstone-card soapstone-enter select-none')}
      style={{
        left: x,
        top: y,
        transform: `rotate(${rot}deg)`,
      }}
      role="note"
      aria-label="Soapstone message"
    >
      <p className="text-sm leading-snug text-zinc-100 whitespace-pre-wrap">{text}</p>
    </div>
  );
}
