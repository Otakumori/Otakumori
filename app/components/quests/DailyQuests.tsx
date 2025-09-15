'use client';
import { useEffect, useState } from 'react';

export default function DailyQuests() {
  const [data, setData] = useState<{
    quests: any[];
    progress: Record<string, number>;
    claimed: string[];
  } | null>(null);
  const refresh = () =>
    fetch('/api/quests')
      .then((r) => r.json())
      .then(setData);

  useEffect(() => {
    refresh();
  }, []);

  const claim = async (id: string) => {
    const res = await fetch('/api/quests', {
      method: 'POST',
      body: JSON.stringify({ questId: id }),
    });
    if (res.ok) refresh();
  };

  if (!data) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-5">
      <div className="mb-3 text-sm font-semibold text-white">Daily Quests</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.quests.map((q) => {
          const count = data.progress[q.id] ?? 0;
          const pct = Math.min(100, Math.round((count / q.target) * 100));
          const done = pct >= 100;
          const claimed = data.claimed.includes(q.id);
          return (
            <div key={q.id} className="rounded-xl border border-white/10 bg-black/40 p-3">
              <div className="text-sm text-white">{q.title}</div>
              <div className="text-xs text-zinc-300">{q.description}</div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-fuchsia-600" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-300">
                <span>
                  {count}/{q.target}
                </span>
                <span>{q.reward} petals</span>
              </div>
              <div className="mt-2">
                <button
                  disabled={!done || claimed}
                  onClick={() => claim(q.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${done && !claimed ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-500' : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}
                >
                  {claimed ? 'Claimed' : 'Claim'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
