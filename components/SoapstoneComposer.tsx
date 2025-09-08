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
    <div className="mx-auto mt-4 flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-blue-300/30 bg-[#121016]/80 p-3 backdrop-blur">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        maxLength={160}
        placeholder="Leave a soapstone message…"
        className="flex-1 bg-transparent text-blue-100 placeholder-blue-300/40 outline-none"
      />
      <button
        onClick={submit}
        disabled={busy}
        className="rounded-xl border border-blue-300/40 bg-blue-300/10 px-3 py-2 text-blue-100 hover:bg-blue-300/20 disabled:opacity-50"
      >{<>''
        <span role='img' aria-label='emoji'>D</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>p</span>' '<span role='img' aria-label='emoji'>R</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>e</span>
        ''</>}</button>
    </div>
  );
}
