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
            <div className="rounded-xl border border-[var(--om-border-soft)] bg-[var(--om-bg-surface)] p-3">
              <label htmlFor="soapstone-textarea" className="block text-[var(--om-text-ivory)] text-sm mb-2">
                Compose a sign…
              </label>
              <textarea
                id="soapstone-textarea"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 280))}
                placeholder="Leave a message for fellow travelers..."
                className="h-16 w-full resize-none rounded-xl bg-[var(--om-bg-root)] border border-[var(--om-border-soft)] p-2 text-[var(--om-text-ivory)] placeholder-[var(--om-text-ivory)]/50 outline-none focus:border-[var(--om-accent-pink)] focus:ring-2 focus:ring-[var(--om-accent-pink)]/30"
                maxLength={280}
              />
              <div className="mt-2 flex items-center justify-between text-xs text-[var(--om-text-ivory)]/70">
                <span>{280 - text.length} left</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-2.5 py-1 text-[var(--om-text-ivory)]/70 hover:text-[var(--om-text-ivory)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[var(--om-bg-surface)] border border-[var(--om-border-strong)] px-3 py-1.5 text-[var(--om-text-ivory)] transition hover:bg-[var(--om-accent-pink)]/10 hover:border-[var(--om-accent-pink)] disabled:opacity-40 disabled:cursor-not-allowed"
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
