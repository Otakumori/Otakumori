'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useQuests } from '@/app/hooks/useQuests';

export default function PlayPage() {
  const { trackQuest } = useQuests();

  useEffect(() => {
    trackQuest('browse-collection');
  }, [trackQuest]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-black p-6 text-center text-slate-200">
      <div className="max-w-xl space-y-4 rounded-2xl border border-white/10 bg-white/5 p-10 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-semibold">Playground Moved</h1>
        <p className="text-sm text-slate-300">
          The experimental playground now lives inside the signed-in hub experience. Head over to
          the new mini-games launcher to keep exploring interactive assets and SFX demos.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/hub"
            className="rounded-lg bg-fuchsia-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-fuchsia-400"
          >
            Go to Hub
          </Link>
          <Link
            href="/mini-games"
            className="rounded-lg border border-white/20 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Browse Mini-games
          </Link>
        </div>
      </div>
    </main>
  );
}
