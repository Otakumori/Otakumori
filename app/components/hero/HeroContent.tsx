'use client';

import Link from 'next/link';
import { paths } from '@/lib/paths';

export default function HeroContent() {
  return (
    <div className="relative z-20 flex items-center justify-center min-h-[100svh] text-center px-4">
      <div className="max-w-2xl">
        <p className="text-pink-200/70 text-sm tracking-wide mb-4">
          Welcome, Traveler
        </p>

        <h1 className="text-4xl md:text-6xl font-bold text-white">
          Enter the Realm
        </h1>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={paths.shop()} className="px-6 py-3 bg-pink-500/20 border border-pink-400/30 text-pink-200 rounded-xl hover:bg-pink-500/30 transition">
            Visit the Shop
          </Link>

          <Link href={paths.games()} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition">
            Play Mini-Games
          </Link>

          <Link href={paths.community()} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition">
            Join the Community
          </Link>
        </div>
      </div>
    </div>
  );
}
