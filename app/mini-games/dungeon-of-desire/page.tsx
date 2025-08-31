'use client';

import { STANDALONE_GAMES } from '@/components/arcade/registry';
import Engine from '@/components/arcade/Engine';

export default function DungeonOfDesirePage() {
  const game = STANDALONE_GAMES['dungeon-of-desire'];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-2">{game.label}</h1>
      <p className="text-sm opacity-80 mb-6">
        Navigate the roguelite tease in this dungeon crawler microgame. Find the treasure and earn
        petals!
      </p>
      <div className="rounded-2xl bg-white/5 backdrop-blur p-4 ring-1 ring-white/10">
        <Engine playlist={[game]} mode="long" autoplay={false} />
      </div>
    </div>
  );
}
