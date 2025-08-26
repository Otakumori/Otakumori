/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useSearchParams, useRouter } from "next/navigation";

export default function Filters(){
  const sp = useSearchParams(); const router = useRouter();
  function set(k:string,v:string){
    const q = new URLSearchParams(sp.toString());
    if (v) q.set(k,v); else q.delete(k);
    router.replace(`/trade?${q.toString()}`, { scroll:false });
  }
  const kind = sp.get("kind") || "all";
  const tag = sp.get("tag") || "";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select className="btn" value={kind} onChange={e=>set("kind", e.target.value)}>
        <option value="all">All</option>
        <option value="cosmetic">Avatar</option>
        <option value="overlay">Overlays</option>
        <option value="text">Text Styles</option>
        <option value="cursor">Cursors</option>
      </select>
      <select className="btn" value={tag} onChange={e=>set("tag", e.target.value)}>
        <option value="">Any tag</option>
        <option value="seasonal">Seasonal</option>
        <option value="event">Event</option>
        <option value="legendary">Legendary</option>
      </select>
      <div className="ml-auto text-sm">Petals <b className="price">{dataOr("-")}</b> • Runes <b className="price">{dataOr("-", true)}</b></div>
    </div>
  );

  function dataOr(def:string, runes=false){
    try {
      const b = JSON.parse((document.querySelector("script#__shop_bal") as any)?.textContent ?? "{}");
      return runes ? b?.runes ?? def : b?.petals ?? def;
    } catch { return def; }
  }
}
