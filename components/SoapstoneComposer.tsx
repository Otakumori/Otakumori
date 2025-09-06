'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';

export default function SoapstoneComposer() {
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);
  const { mutate } = useSWRConfig();

  async function submit() {
    if (!val.trim()) return;

    setBusy(true);
    const content = val.trim().slice(0, 160);

    try {
      const res = await fetch('/api/soapstones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setVal('');
        mutate('/api/soapstones'); // refresh dock
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-12 flex w-full max-w-5xl items-center gap-3 rounded-2xl border border-pink-300/30 bg-[#121016]/80 p-3 backdrop-blur">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        maxLength={160}
        placeholder="Leave a soapstone message…"
        className="flex-1 bg-transparent text-pink-100 placeholder-pink-300/40 outline-none"
      />
      <button
        onClick={submit}
        disabled={busy}
        className="rounded-xl border border-pink-300/40 bg-pink-300/10 px-3 py-2 text-pink-100 hover:bg-pink-300/20 disabled:opacity-50"
      >
        Drop Rune
      </button>
    </div>
  );
}
