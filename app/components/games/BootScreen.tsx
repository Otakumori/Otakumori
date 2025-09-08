"use client";
import { useEffect, useState } from "react";

export default function BootScreen({ gameId, children }: { gameId: string; children: React.ReactNode }) {
  const key = `boot:${gameId}`;
  const [ready, setReady] = useState(false);
  const [showBoot, setShowBoot] = useState(true);

  useEffect(() => {
    const seen = sessionStorage.getItem(key) === "1";
    setShowBoot(!seen);
    setReady(true);
  }, [key]);

  const start = () => {
    sessionStorage.setItem(key, "1");
    setShowBoot(false);
  };

  if (!ready) return null;

  return (
    <>
      {children}
      {showBoot && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/85">
          <div className="select-none rounded-2xl border border-fuchsia-500/30 bg-zinc-950/80 p-6 text-center shadow-2xl">
            <div className="mb-4 text-xs uppercase tracking-[0.25em] text-fuchsia-300/80">Otaku-mori System</div>
            <div className="mb-6 text-2xl font-bold text-fuchsia-200">Boot Menu</div>
            <button
              onClick={start}
              className="rounded-md bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-fuchsia-400"
            >
              Press Start
            </button>
          </div>
        </div>
      )}
    </>
  );
}
