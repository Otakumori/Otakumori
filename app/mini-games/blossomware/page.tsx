// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { GAMES } from '@/components/arcade/registry';
import Engine from '@/components/arcade/Engine';

export default function BlossomwarePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-2">BlossomWare Playlist</h1>
      <p className="text-sm opacity-80 mb-6">
        Chaotic sensual micro-sessions that pay petals. Keep your streak alive, Commander Senpai.
      </p>
      <div className="rounded-2xl bg-white/5 backdrop-blur p-4 ring-1 ring-white/10">
        <Engine playlist={GAMES} mode="long" autoplay />
      </div>
    </div>
  );
}
