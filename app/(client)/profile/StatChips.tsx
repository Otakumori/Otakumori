/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import useSWR from "swr";

export default function StatChips(){
  const { data } = useSWR("/api/profile/me", (u)=>fetch(u).then(r=>r.json()));
  return (
    <div className="chips">
      <div className="chip">Petals <b>{data?.balances?.petals ?? 0}</b></div>
      <div className="chip">Runes <b>{data?.balances?.runes ?? 0}</b></div>
      <div className="chip">Posts <b>{data?.posts?.length ?? 0}</b></div>
      <div className="chip">Achievements <b>{data?.achievements?.length ?? 0}</b></div>
    </div>
  );
}
