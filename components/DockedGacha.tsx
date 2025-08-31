/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuests } from '@/app/hooks/useQuests';

function shouldShowToday() {
  try {
    const k = 'gacha:lastShown';
    const last = localStorage.getItem(k);
    const today = new Date().toISOString().slice(0, 10);
    if (last === today) return false;
    // show once/day after 10s on page
    setTimeout(() => localStorage.setItem(k, today), 0);
    return true;
  } catch {
    return false;
  }
}

export default function DockedGacha() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { trackQuest } = useQuests();

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timer = setTimeout(() => setVisible(shouldShowToday()), mq.matches ? 0 : 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  async function roll() {
    setLoading(true);
    setMsg(null);

    try {
      // Track gacha roll for quests
      await trackQuest('gacha-roll');

      const r = await fetch('/api/gacha', { method: 'POST' });
      const data = await r.json();

      if (!r.ok) throw new Error(data?.error || 'roll failed');

      if (data.type === 'coupon') {
        setMsg(`You earned a ${Math.round((data.amount ?? 0) * 100)}% voucher!`);
        // Dispatch event for cart to listen to
        window.dispatchEvent(
          new CustomEvent('coupon:earned', {
            detail: { pct: data.amount },
          }),
        );
      } else if (data.type === 'item') {
        setMsg(`Bonus Loot: ${data.item?.name} added to your bag!`);
        window.dispatchEvent(
          new CustomEvent('cart:add', {
            detail: { item: data.item },
          }),
        );
      } else {
        setMsg('A curious silence… try again later.');
      }
    } catch (e: any) {
      setMsg(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside
      aria-label="Lucky Draw"
      className="fixed bottom-4 right-4 z-40 select-none"
      style={{ pointerEvents: 'auto' }}
    >
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-2xl border border-slate-700 bg-cube-900/90 px-3 py-2 text-slatey-200 shadow-glow hover:bg-cube-900 transition-all duration-200"
          aria-expanded="false"
        >
          🎰 Lucky&nbsp;Draw
        </button>
      ) : (
        <div className="w-72 rounded-2xl border border-slate-700 bg-cube-900/95 p-3 shadow-glow backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <strong className="text-slatey-200">Lucky Draw</strong>
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="text-slatey-400 hover:text-slatey-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 text-sm text-slatey-400">
            Roll once a day for a small perk. Totally optional.
          </p>
          <button
            onClick={roll}
            disabled={loading}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-sakura-500/20 px-3 py-2 text-slatey-200 hover:bg-sakura-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Rolling…' : 'Roll'}
          </button>
          {msg && (
            <p className="mt-2 text-sm text-slatey-200 bg-slate-800/50 rounded-lg p-2">{msg}</p>
          )}
        </div>
      )}
    </aside>
  );
}
