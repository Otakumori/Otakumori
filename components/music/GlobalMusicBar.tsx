"use client";

import { useMusic } from "./GlobalMusicProvider";
import { useEffect, useState } from "react";

export default function GlobalMusicBar() {
  const { playlist, current, playing, volume, setVolume, toggle, next, prev, optIn, setOptIn } = useMusic();
  const track = playlist?.tracks?.[current];
  const [shown, setShown] = useState(true);

  // Don't autoplay; ask once
  useEffect(() => {
    if (!optIn) setShown(true);
  }, [optIn]);

  if (!playlist) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-zinc-800/60 bg-black/70 px-4 py-2 backdrop-blur">
        {!optIn ? (
          <>
            <span className="text-sm text-zinc-300">Enable site music?</span>
            <button
              onClick={() => setOptIn(true)}
              className="rounded-md bg-pink-600 px-3 py-1 text-sm font-medium hover:bg-pink-500"
            >
              Yes
            </button>
            <button
              onClick={() => setShown(false)}
              className="rounded-md border border-zinc-700 px-3 py-1 text-sm hover:bg-zinc-900"
            >
              Not now
            </button>
          </>
        ) : (
          <>
            <button onClick={prev} className="rounded px-2 py-1 hover:bg-zinc-900">⏮</button>
            <button onClick={toggle} className="rounded px-2 py-1 hover:bg-zinc-900">{playing ? "⏸" : "▶️"}</button>
            <button onClick={next} className="rounded px-2 py-1 hover:bg-zinc-900">⏭</button>
            <div className="min-w-[200px] text-sm">
              <div className="truncate font-medium">{track?.title ?? "Untitled"}</div>
              <div className="truncate text-xs text-zinc-400">{track?.artist ?? ""}</div>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-28"
              aria-label="Volume"
            />
            <button onClick={() => setOptIn(false)} className="rounded px-2 py-1 hover:bg-zinc-900">🔇</button>
          </>
        )}
      </div>
    </div>
  );
}
