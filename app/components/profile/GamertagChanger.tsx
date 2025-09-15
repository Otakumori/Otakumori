'use client';
import { useState } from 'react';
import { generateGamertag } from '@/app/lib/gamertag';

export function GamertagChanger() {
  const [name, setName] = useState(generateGamertag());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true);
    const res = await fetch('/api/profile/gamertag', {
      method: 'POST',
      body: JSON.stringify({ gamertag: name }),
    });
    setSaving(false);
    if (res.ok) setMsg('Gamertag updated');
    else setMsg((await res.json()).error || 'Failed to update');
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-5">
      <label htmlFor="gamertag-input" className="mb-3 block text-sm font-semibold text-white">
        Gamertag
      </label>
      <div className="flex gap-2">
        <input
          id="gamertag-input"
          name="gamertag"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-white outline-none"
          aria-label="Enter your gamertag"
        />
        <button
          onClick={() => setName(generateGamertag())}
          className="rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-white hover:border-fuchsia-500/50"
        >
          Random
        </button>
        <button
          disabled={saving}
          onClick={submit}
          className="rounded-xl bg-fuchsia-600 px-4 py-2 font-semibold text-white hover:bg-fuchsia-500"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      {msg && <div className="mt-2 text-xs text-zinc-300">{msg}</div>}
    </div>
  );
}
