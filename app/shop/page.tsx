'use client';

import Link from 'next/link';

const CATS = [
  ['apparel',['tops','bottoms','unmentionables','kicks']],
  ['accessories',['pins','hats','bows']],
  ['home-decor',['cups','pillows','stickers']],
] as const;

export default function ShopHome() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Shop</h1>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {CATS.map(([cat, subs]) => (
            <div key={cat} className="rounded-xl border border-white/10 p-4">
              <div className="font-medium capitalize">{cat.replace('-', ' ')}</div>
              <ul className="mt-2 text-sm text-neutral-300">
                {subs.map(s => (
                  <li key={s}><Link className="underline" href={`/shop/${cat}/${s}`}>{s}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}