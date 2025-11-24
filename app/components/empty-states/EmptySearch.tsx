'use client';

import { EmptySearchIcon } from './icons';
import { paths } from '@/lib/paths';
import Link from 'next/link';

interface EmptySearchProps {
  query?: string;
}

export function EmptySearch({ query }: EmptySearchProps) {
  return (
    <section className="flex flex-col items-center gap-3 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-lg px-6 py-8 text-center shadow-[0_26px_80px_rgba(15,23,42,0.96)]">
      <div className="mb-2">
        <EmptySearchIcon />
      </div>
      <h2 className="text-sm font-semibold tracking-[0.28em] uppercase text-white/80">
        No results found
      </h2>
      <p className="max-w-md text-sm text-white/60">
        {query
          ? `Nothing matches "${query}". Try different keywords or browse our collection.`
          : 'Try searching for products, games, or blog posts.'}
      </p>
      <ul className="mt-4 space-y-1 text-xs text-white/50">
        <li>• Try different keywords</li>
        <li>• Check your spelling</li>
        <li>• Use more general terms</li>
      </ul>
      <Link
        href={paths.shop()}
        className="mt-4 rounded-full bg-gradient-to-r from-pink-500/80 via-pink-500 to-pink-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_30px_rgba(236,72,153,0.3)] hover:from-pink-500 hover:via-pink-400 hover:to-pink-300 transition-all"
      >
        Browse Shop
      </Link>
    </section>
  );
}
