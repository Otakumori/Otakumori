/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import useSWR from "swr";

export default function AchievementsGrid(){
  const { data } = useSWR("/api/profile/me", (u)=>fetch(u).then(r=>r.json()));
  const list = data?.achievements ?? [];
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {list.map((a:any)=>(
        <div key={a.code} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="badge">🏆</div>
          <div>
            <div className="font-semibold">{a.name}</div>
            <div className="text-sm opacity-80">{a.desc}</div>
            <div className="mt-1 text-xs opacity-70">{new Date(a.when).toLocaleString()}</div>
          </div>
        </div>
      ))}
      {!list.length && <div className="text-sm opacity-60">No achievements yet.</div>}
    </div>
  );
}
