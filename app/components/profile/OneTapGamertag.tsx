'use client';

import { useState, useTransition } from 'react';
import { renameGamertag } from '@/app/actions/renameGamertag';
import { MoriSystemState } from '@/app/components/mori/MoriProduction';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/Dialog';

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
    <section className="ritual-name-forge" aria-labelledby="name-forge-title">
      <div className="ritual-name-forge__layout">
        <div className="ritual-name-forge__record">
          <h2 id="name-forge-title" className="font-display text-xl font-semibold text-[#fff1e4]">
            Name Forge
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#cdbbb7]">
            Your public gamertag is separate from sign-in. Generate a few, choose one, then confirm only when it feels right.
          </p>
          <div className="ritual-name-forge__current">
            <div>Current name</div>
            <strong>{initial ?? '—'}</strong>
          </div>
        </div>

        <div className="ritual-name-forge__controls" aria-busy={generating || busy || undefined}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#fff1e4]">Forged suggestions</h3>
              <p className="mt-1 text-xs text-[#8f7f7d]">Fresh combinations each time.</p>
            </div>
            <button type="button" onClick={generate} disabled={generating || busy} className="mori-button-secondary">
              {generating ? 'Forging…' : suggestions.length ? 'Forge again' : 'Forge names'}
            </button>
          </div>

          <div className="ritual-name-forge__suggestions" role="group" aria-label="Forged gamertag suggestions">
            {suggestions.length ? (
              suggestions.map((name) => {
                const active = selected === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelected(name)}
                    className="ritual-name-forge__suggestion"
                    data-selected={active || undefined}
                    aria-pressed={active}
                  >
                    {name}
                  </button>
                );
              })
            ) : (
              <p className="ritual-name-forge__empty">
                Forge a set when you want a new public name.
              </p>
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

          {msg ? <MoriSystemState className="ritual-name-forge__feedback" state="success" title="Name updated" description={msg} /> : null}
          {err ? <MoriSystemState className="ritual-name-forge__feedback" state="error" title="Name not changed" description={err} /> : null}
        </div>
      </div>
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="ritual-system-dialog">
          <DialogHeader>
            <DialogTitle>Confirm public name</DialogTitle>
            <DialogDescription>
              Change your public gamertag to <strong>{selected}</strong>? You will not be able to rename again for one year.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" onClick={() => setConfirming(false)} className="mori-button-secondary">Cancel</button>
            <button type="button" onClick={apply} disabled={busy} className="mori-button-danger">{busy ? 'Applying…' : 'Confirm name'}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
