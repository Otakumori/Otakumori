/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';
import { useEffect, useState } from 'react';

export default function NSFWAffirmNote() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const k = 'nsfw:affirmed';
    if (localStorage.getItem(k) === '1') return;
    setShow(true);
  }, []);

  if (!show) return null;

  const handleAffirm = async () => {
    localStorage.setItem('nsfw:affirmed', '1');
    setShow(false);

    try {
      await fetch('/api/prefs/nsfw/affirm', { method: 'POST' });
    } catch (error) {
      console.error('Failed to log NSFW affirmation:', error);
    }
  };

  return (
    <div className="my-3 rounded-xl border border-slate-700 bg-cube-900 p-3 text-sm text-slatey-400">
      This gallery may contain R-18 content. By continuing you confirm you're 18+ and wish to view
      it.
      <button
        className="ml-2 underline hover:text-slatey-300 transition-colors"
        onClick={handleAffirm}
      >
        OK
      </button>
    </div>
  );
}
