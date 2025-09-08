"use client";

import { useEffect, useState, useTransition } from "react";
import { renameGamertag } from "@/app/actions/renameGamertag";

export default function GamertagStep({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  async function suggest() {
    setErr(null);
    const res = await fetch(`/api/gamertag/suggest?maxLen=16&sep=-&numbers=suffix`, { cache: "no-store" });
    const j = await res.json();
    setName(j.name || "");
  }

  useEffect(() => { suggest(); }, []);

  function useIt() {
    setConfirming(true);
  }

  function confirm() {
    start(async () => {
      try {
        await renameGamertag(name);
        onDone();
      } catch (e: any) {
        setErr(e?.message ?? "Could not set gamertag");
      } finally {
        setConfirming(false);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-6">
      <h2 className="mb-2 text-xl font-medium text-zinc-100">Choose your Gamertag</h2>
      <p className="mb-4 text-sm text-zinc-400">This is your display name across Otaku-mori.</p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={suggest}
          className="rounded-full bg-fuchsia-600 px-4 py-2 text-sm text-white hover:bg-fuchsia-500"
        >
          Randomize
        </button>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          autoComplete="nickname"
          name="gamertag"
          inputMode="text"
          className="min-w-[240px] flex-1 rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-zinc-100 outline-none"
          placeholder="Your gamertag"
          maxLength={24}
        />

        <button
          onClick={useIt}
          disabled={!name || pending}
          className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
        >
          Use this
        </button>
      </div>

      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}

      {confirming && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/70 p-4">
          <div className="mb-2 text-zinc-200">Set <span className="font-semibold">{name}</span> as your gamertag?</div>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirming(false)}
              className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={confirm}
              className="rounded-full bg-fuchsia-600 px-4 py-2 text-sm text-white hover:bg-fuchsia-500"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
