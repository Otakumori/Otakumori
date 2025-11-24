'use client';

import Link from 'next/link';
import { EmptyOrdersIcon } from './icons';
import { paths } from '@/lib/paths';

export function EmptyOrders() {
  return (
    <section className="flex flex-col items-center gap-3 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-lg px-6 py-8 text-center shadow-[0_26px_80px_rgba(15,23,42,0.96)]">
      <div className="mb-2">
        <EmptyOrdersIcon />
      </div>
      <h2 className="text-sm font-semibold tracking-[0.28em] uppercase text-white/80">
        No orders yet
      </h2>
      <p className="max-w-md text-sm text-white/60">
        Your order history will appear here once you make your first purchase.
      </p>
      <Link
        href={paths.shop()}
        className="mt-3 rounded-full bg-gradient-to-r from-pink-500/80 via-pink-500 to-pink-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_30px_rgba(236,72,153,0.3)] hover:from-pink-500 hover:via-pink-400 hover:to-pink-300 transition-all"
      >
        Start shopping
      </Link>
    </section>
  );
}

