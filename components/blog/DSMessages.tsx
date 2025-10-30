'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { OPENERS, SUBJECTS, JOINERS, QUALIFIERS } from '@/lib/dsLexicon';

type Item = {
  id: string;
  phrase: string;
  createdAt: string;
  appraisals: number;
  disparages: number;
};

export default function DSMessages({ slug }: { slug: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [opener, setOpener] = useState(OPENERS[0]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [joiner, setJoiner] = useState(JOINERS[0]);
  const [qual, setQual] = useState(QUALIFIERS[0]);

  const phrase = useMemo(
    () => `${opener} ${subject} ${joiner} ${qual}`.replace(/\s+/g, ' ').trim().slice(0, 80),
    [opener, subject, joiner, qual],
  );

  async function refresh() {
    setLoading(true);
    const r = await fetch(`/api/ds-messages/${slug}`, { cache: 'no-store' });
    const j = await r.json();
    setItems(j?.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [slug]);

  async function submit() {
    const r = await fetch(`/api/ds-messages/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrase }),
    });
    const j = await r.json();
    if (j?.ok) setItems((prev) => [j.item, ...prev]);
    else alert(j?.error ?? 'Message failed to take form.');
  }

  async function vote(id: string, kind: 'up' | 'down') {
    const r = await fetch(`/api/ds-messages/${slug}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, kind }),
    });
    const j = await r.json();
    if (j?.ok) setItems((prev) => prev.map((x) => (x.id === id ? j.item : x)));
  }

  return (
    <section aria-labelledby="ds-messages-heading" className="mt-14">
      <h2 id="ds-messages-heading" className="text-xl font-semibold tracking-wide mb-3">
        Messages left by other travelers
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 backdrop-blur bg-white/5 border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
      >
        <div className="text-sm opacity-80 mb-2">Compose a message</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <select
            aria-label="Opener"
            className="p-2 rounded-xl bg-black/30 border border-white/10"
            value={opener}
            onChange={(e) => setOpener(e.target.value)}
          >
            {OPENERS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <select
            aria-label="Subject"
            className="p-2 rounded-xl bg-black/30 border border-white/10"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {SUBJECTS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <select
            aria-label="Joiner"
            className="p-2 rounded-xl bg-black/30 border border-white/10"
            value={joiner}
            onChange={(e) => setJoiner(e.target.value)}
          >
            {JOINERS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <select
            aria-label="Qualifier"
            className="p-2 rounded-xl bg-black/30 border border-white/10"
            value={qual}
            onChange={(e) => setQual(e.target.value)}
          >
            {QUALIFIERS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="mt-3 text-pink-200/90 text-lg font-semibold tracking-wide">"{phrase}"</div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={submit}
            className="px-3 py-2 rounded-xl bg-pink-500/80 hover:bg-pink-500 text-black font-semibold"
          >
            Leave message
          </button>
          <button onClick={refresh} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20">
            Refresh
          </button>
        </div>
      </motion.div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="opacity-70">Messages coalescing…</div>
        ) : items.length === 0 ? (
          <div className="opacity-70">No messages yet. Be the first Tarnished.</div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06),transparent_60%)] border border-white/10 backdrop-blur flex items-center justify-between"
            >
              <div className="text-pink-100/95 text-base">"{item.phrase}"</div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => vote(item.id, 'up')}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  Praise {item.appraisals}
                </button>
                <button
                  onClick={() => vote(item.id, 'down')}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  Boo {item.disparages}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
