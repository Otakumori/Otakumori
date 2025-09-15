'use client';
import { useEffect, useRef, useState } from 'react';

export default function SoapstoneFooterMini() {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    const t = text.trim();
    if (!t) return;
    setBusy(true);
    const res = await fetch('/api/soapstone', {
      method: 'POST',
      body: JSON.stringify({ text: t }),
    });
    setBusy(false);
    if (res.ok) {
      setText('');
      // dispatch an event that home page listens to for animation injection
      document.dispatchEvent(new CustomEvent('soapstone:new', { detail: { text: t } }));
    }
  };

  useEffect(() => {
    // optional: keyboard submit
    const el = inputRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement === el) submit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [text]);

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        placeholder="Leave a Soapstone tip (no emojis)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={140}
        className="w-72 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-sm text-white outline-none placeholder:text-zinc-400"
      />
      <button
        disabled={busy}
        onClick={submit}
        className="rounded-full bg-fuchsia-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-fuchsia-500"
      >
        Post
      </button>
    </div>
  );
}
