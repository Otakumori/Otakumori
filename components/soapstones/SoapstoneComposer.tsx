// components/soapstones/SoapstoneComposer.tsx
'use client';

import { useState } from 'react';

export default function SoapstoneComposer() {
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setPending(true);
    try {
      const res = await fetch('/api/soapstones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Failed');
      setText('');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Leave a message…"
        aria-label="Write a soapstone message"
        className="w-full rounded-xl bg-white/8 border border-white/10 px-4 py-2 text-pink-100
                   placeholder-pink-200/60 focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="absolute right-1 top-1 rounded-lg bg-pink-600/80 px-3 py-1 text-sm text-white
                   hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60"
      >
        Post
      </button>
    </form>
  );
}
