/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import useSWR from "swr";

export default function PetalProgress(){
  const { data } = useSWR("/api/profile/me", (u)=>fetch(u).then(r=>r.json()));
  const used = data?.daily?.used ?? 0, limit = data?.daily?.limit ?? 500;
  const pct = Math.max(0, Math.min(100, Math.round((used/limit)*100)));
  return (
    <div>
      <div className="mb-1 text-sm opacity-80">Daily Petal Progress</div>
      <div className="progress"><span style={{ width:`${pct}%` }} /></div>
      <div className="mt-1 text-xs opacity-70">{used} / {limit} petals today</div>
    </div>
  );
}
