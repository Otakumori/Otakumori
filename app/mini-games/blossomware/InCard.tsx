'use client';

import Engine from '@/components/arcade/Engine';
import { GAMES } from '@/components/arcade/registry';

export default function BlossomwareInCard() {
  return (
    <div className="w-full p-3">
      <Engine playlist={GAMES} mode="long" autoplay />
    </div>
  );
}

