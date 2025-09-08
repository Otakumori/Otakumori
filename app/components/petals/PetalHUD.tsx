"use client";
import { useEffect, useState } from "react";

export default function PetalHUD() {
  const [visible, setVisible] = useState(false);
  const [me, setMe] = useState<number | null>(null);
  const [team, setTeam] = useState<{active:boolean; total:number; goal:number; eventName?:string} | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem("om_petal_seen");
    if (seen === "1") setVisible(true);
    // initial fetch
    fetch("/api/petals/me").then(r => r.json()).then(j => { 
      setMe(j.total); 
      if (j.total > 0) { 
        localStorage.setItem("om_petal_seen", "1"); 
        setVisible(true); 
      }
    });
    fetch("/api/petals/global").then(r => r.json()).then(j => setTeam(j));
  }, []);

  // listen for petal-collect events your games/effects dispatch
  useEffect(() => {
    const onCollect = async () => {
      const j = await fetch("/api/petals/me", { method: "POST" }).then(r => r.json());
      setMe(j.total);
      const g = await fetch("/api/petals/global").then(r => r.json());
      setTeam(g);
      localStorage.setItem("om_petal_seen", "1");
      setVisible(true);
    };
    window.addEventListener("petal:collect", onCollect as any);
    return () => window.removeEventListener("petal:collect", onCollect as any);
  }, []);

  if (!visible) return null;

  const pct = team?.active && team.goal ? Math.min(100, Math.round((team.total / team.goal) * 100)) : 0;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[min(90vw,340px)] space-y-2">
      {/* Personal */}
      <div className="rounded-xl border border-white/12 bg-black/70 p-3 backdrop-blur-md">
        <div className="text-xs text-zinc-300">Petals collected</div>
        <div className="mt-1 text-xl font-semibold text-white">{me ?? 0}</div>
      </div>

      {/* Team (event) */}
      {team?.active && (
        <div className="rounded-xl border border-white/12 bg-black/70 p-3 backdrop-blur-md">
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-300">
            <span>{team.eventName || "Community Bloom"}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-zinc-800">
            <div className="h-full rounded-full bg-fuchsia-600" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
