"use client";

import { useState, useTransition } from "react";
import { renameGamertag } from "@/app/actions/renameGamertag";

export default function OneTapGamertag({ initial }: { initial?: string }) {
  const [suggestion, setSuggestion] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const generate = async () => {
    setErr(null); setMsg(null);
    const r = await fetch(`/api/gamertag/suggest?maxLen=16&sep=-&numbers=suffix`, { cache: "no-store" });
    const j = await r.json();
    setSuggestion(j.name);
  };

  const confirm = () => setConfirming(true);
  const apply = () => {
    start(async () => {
      try {
        await renameGamertag(suggestion);
        setMsg("Gamertag updated.");
      } catch (e:any) {
        setErr(e?.message ?? "Update failed");
      } finally {
        setConfirming(false);
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
      <div className="mb-2 text-sm text-zinc-400">Current</div>
      <div className="mb-4 text-lg text-zinc-100">{initial ?? "—"}</div>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={generate} className="rounded-full bg-fuchsia-600 px-4 py-2 text-sm text-white hover:bg-fuchsia-500">Generate</button>
        <div className="min-h-[2.25rem] flex items-center rounded-lg border border-white/10 bg-black/50 px-3 text-sm text-zinc-100">
          {suggestion || "Click Generate to get a tag"}
        </div>
        <button onClick={confirm} disabled={!suggestion || busy} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50">
          Use this
        </button>
      </div>
      {msg && <p className="mt-3 text-sm text-emerald-400">{msg}</p>}
      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}

      {confirming && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/70 p-4">
          <div className="mb-2 text-zinc-200">Change to <span className="font-semibold">{suggestion}</span>? (1×/year)</div>
          <div className="flex gap-3">
            <button onClick={() => setConfirming(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
            <button onClick={apply} className="rounded-full bg-fuchsia-600 px-4 py-2 text-sm text-white hover:bg-fuchsia-500">Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}
