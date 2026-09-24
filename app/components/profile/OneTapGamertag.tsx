'use client';

import { useState, useTransition } from 'react';
import { renameGamertag } from '@/app/actions/renameGamertag';

export default function OneTapGamertag({ initial }: { initial?: string }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [busy, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const generate = async () => {
    setErr(null);
    setMsg(null);
    setGenerating(true);
    try {
      const r = await fetch('/api/gamertag/suggest?maxLen=16&sep=-&numbers=random&count=4', {
        cache: 'no-store',
      });
      if (!r.ok) throw new Error('Could not generate names');
      const j = await r.json();
      const next = Array.isArray(j.suggestions) ? j.suggestions.filter(Boolean) : [j.name].filter(Boolean);
      setSuggestions(next);
      setSelected(next[0] ?? '');
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Could not generate names');
    } finally {
      setGenerating(false);
    }
  };

  const confirm = () => selected && setConfirming(true);
  const apply = () => {
    start(async () => {
      try {
        await renameGamertag(selected);
        setMsg(`Gamertag updated to ${selected}.`);
      } catch (e: any) {
        setErr(e?.message ?? 'Update failed');
      } finally {
        setConfirming(false);
      }
    });
  };

  return (
    <section className="mori-panel overflow-hidden" aria-labelledby="name-forge-title">
      <div className="grid gap-0 md:grid-cols-[0.8fr_1.2fr]">
        <div className="border-b border-white/[0.08] p-5 md:border-b-0 md:border-r sm:p-6">
          <h2 id="name-forge-title" className="font-display text-xl font-semibold text-[#fff1e4]">
            Name Forge
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#cdbbb7]">
            Your public gamertag is separate from sign-in. Generate a few, choose one, then confirm only when it feels right.
          </p>
          <div className="mt-5 border-t border-white/[0.08] pt-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-[#8f7f7d]">Current name</div>
            <div className="mt-2 break-all font-display text-lg text-[#fff1e4]">{initial ?? '—'}</div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#fff1e4]">Forged suggestions</h3>
              <p className="mt-1 text-xs text-[#8f7f7d]">Fresh combinations each time.</p>
            </div>
            <button type="button" onClick={generate} disabled={generating || busy} className="mori-button-secondary disabled:opacity-50">
              {generating ? 'Forging…' : suggestions.length ? 'Forge again' : 'Forge names'}
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {suggestions.length ? (
              suggestions.map((name) => {
                const active = selected === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelected(name)}
                    className={`min-h-14 rounded-xl border px-4 py-3 text-left font-display text-sm transition-colors ${
                      active
                        ? 'border-[#c7a97f]/38 bg-[#a9855f]/14 text-[#fff1e4]'
                        : 'border-white/[0.08] bg-black/20 text-[#cdbbb7] hover:border-white/[0.16] hover:text-white'
                    }`}
                    aria-pressed={active}
                  >
                    {name}
                  </button>
                );
              })
            ) : (
              <div className="mori-panel-soft col-span-full px-4 py-7 text-center text-sm text-[#8f7f7d]">
                Forge a set when you want a new public name.
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={confirm}
              disabled={!selected || busy}
              className="mori-button-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Use selected name
            </button>
            <span className="text-xs text-[#8f7f7d]">Rename limit: once per year.</span>
          </div>

          {msg && <p className="mt-4 text-sm text-[#b9d0b6]">{msg}</p>}
          {err && <p className="mt-4 text-sm text-[#e0aaa6]">{err}</p>}

          {confirming && (
            <div className="mori-panel-soft mt-5 p-4">
              <p className="text-sm leading-6 text-[#cdbbb7]">
                Change your public gamertag to <span className="font-semibold text-[#fff1e4]">{selected}</span>? You will not be able to rename again for one year.
              </p>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setConfirming(false)} className="mori-button-secondary">
                  Cancel
                </button>
                <button type="button" onClick={apply} disabled={busy} className="mori-button-primary disabled:opacity-50">
                  {busy ? 'Applying…' : 'Confirm name'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
