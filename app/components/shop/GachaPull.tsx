"use client";
import { useState } from "react";

export function GachaPull() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const pull = async () => {
    setBusy(true);
    const res = await fetch("/api/petal-gacha", { method: "POST" });
    setBusy(false);
    if (res.ok) {
      const j = await res.json();
      setResult(j.reward);
      // TODO: show blade-style toast; also refresh inventory
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-5">
      <div className="mb-2 text-sm font-semibold text-white">Petal Gacha</div>
      <p className="text-xs text-zinc-300">Spend 50 petals for a random cosmetic. Rewards include banners, frames, titles, and rare relics.</p>
      <button disabled={busy} onClick={pull} className="mt-3 rounded-xl bg-fuchsia-600 px-4 py-2 font-semibold text-white hover:bg-fuchsia-500">
        {busy ? "Pulling..." : "Pull (50 petals)"}
      </button>
      {result && <div className="mt-3 rounded-lg border border-fuchsia-500/30 bg-black/60 p-3 text-sm text-white">
        You obtained: <span className="font-semibold text-fuchsia-300">{result}</span>
      </div>}
    </div>
  );
}
