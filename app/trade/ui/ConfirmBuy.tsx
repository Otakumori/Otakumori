"use client";
import { useState } from "react";

export default function ConfirmBuy({ item, balances, onClose, onChanged }:{
  item:any, balances:{petals:number; runes:number}, onClose:()=>void, onChanged:()=>void
}){
  const [busy, setBusy] = useState(false);
  const priceStr = item.priceRunes>0 ? `${item.priceRunes} Runes` : `${item.pricePetals} Petals`;

  async function buy(){
    setBusy(true);
    const res = await fetch("/api/shop/purchase", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ sku:item.sku })
    });
    setBusy(false);
    if (res.ok){ onChanged(); onClose(); } else { alert("Purchase failed"); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm">
      <div className="glass p-4 max-w-md w-full">
        <h3 className="mb-2 text-lg font-semibold">Confirm Purchase</h3>
        <div className="flex gap-3">
          <img src={item.previewUrl} alt="" className="h-20 w-20 rounded-lg border border-white/10 object-cover" />
          <div className="text-sm opacity-90">
            <div className="font-medium">{item.name}</div>
            <div className="mt-1">Price: <b className="price">{priceStr}</b></div>
            <div className="mt-1 text-xs opacity-70">You have: {balances.petals} petals • {balances.runes} runes</div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={busy} onClick={buy}>Buy</button>
        </div>
      </div>
    </div>
  );
}
