/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import useSWR from "swr";

export default function LeaderboardPanel({ game, diff }:{ game:string; diff?:string|null }){
  const key = `/api/leaderboard/${encodeURIComponent(game)}${diff ? `?diff=${diff}` : ""}`;
  const { data } = useSWR(key, (u)=>fetch(u).then(r=>r.json()));
  const list = data?.top ?? [];

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white/85">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold">{diff ? `Top (${diff})` : "Top Scores"}</div>
        <div className="text-xs text-white/60">{list.length} entries</div>
      </div>
      <ol className="space-y-1">
        {list.map((row:any, i:number)=>(
          <li key={i} className="flex items-center justify-between">
            <span className="text-white/70">#{i+1}</span>
            <span className="truncate text-white/90">
              {maskUser(row.userId)}
            </span>
            <span className="tabular-nums text-emerald-300">{row.score}</span>
          </li>
        ))}
        {!list.length && <li className="text-white/60">No scores yet.</li>}
      </ol>
    </div>
  );
}

function maskUser(uid?:string){
  if (!uid) return "Guest";
  if (uid.length <= 6) return uid;
  return uid.slice(0,3) + "…" + uid.slice(-3);
}
