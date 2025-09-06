'use client';
import { useState } from 'react';

export default function SoapstoneComposer({ postId }: { postId?: string }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const max = 2800;

  async function submit() {
    if (!text.trim() || busy) return;
    setBusy(true);
    const res = await fetch('/api/soapstone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, text }),
    });
    setBusy(false);
    if (res.ok) setText('');
    else alert('Message failed.');
  }

  return (
    <div className="rounded-2xl border bg-black/30 backdrop-blur p-4 space-y-3 shadow-xl">
      <textarea
        className="w-full resize-y rounded-xl bg-black/40 p-3 leading-6 outline-none ring-1 ring-white/10 focus:ring-purple-400/40 text-white placeholder-white/40"
        placeholder="Leave a mark..."
        value={text}
        maxLength={max}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>{max - text.length}</span>
        <button
          onClick={submit}
          disabled={busy || !text.trim()}
          className="rounded-full px-4 py-2 text-sm font-medium bg-purple-500/80 hover:bg-purple-400/90 disabled:opacity-40"
        >
          Leave a mark
        </button>
      </div>
    </div>
  );
}
