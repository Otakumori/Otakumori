'use client';
import { useCallback, useState } from 'react';

export default function RhythmClient() {
  const [runId, setRunId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const start = useCallback(async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/mini-games/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: 'rhythm' }),
      });
      const j = await res.json();
      if (j.runId) setRunId(j.runId);
    } finally {
      setBusy(false);
    }
  }, []);

  const submit = useCallback(async () => {
    if (!runId) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/mini-games/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, game: 'rhythm', score }),
      });
      const j = await res.json();
      if (j?.ok) {
        const g = j.petalsGranted ?? 0;
        setMsg(`Submitted. +${g} petals${j.balance != null ? ` • Balance ${j.balance}` : ''}`);
      } else setMsg(j?.error || 'Submit failed');
    } finally {
      setBusy(false);
    }
  }, [runId, score]);

  return (
    <div className="rounded-xl border border-white/10 bg-black/60 p-4 text-white">
      <div className="mb-2 text-pink-200">Rhythm — Ready</div>
      <div className="flex items-center gap-2">
        <button
          onClick={start}
          disabled={busy}
          className="rounded bg-pink-600 px-3 py-1 disabled:opacity-50"
        >
          {runId ? 'Restart' : 'Start'}
        </button>
        <label className="text-sm text-zinc-300 inline-flex items-center gap-2">
          Score
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value) || 0)}
            className="ml-2 w-24 rounded bg-black/40 px-2 py-1 outline-none ring-1 ring-white/15"
          />
        </label>
        <button
          onClick={submit}
          disabled={!runId || busy}
          className="rounded bg-pink-600 px-3 py-1 disabled:opacity-50"
        >
          Submit
        </button>
      </div>
      {msg && <div className="mt-2 text-xs text-zinc-300">{msg}</div>}
    </div>
  );
}
