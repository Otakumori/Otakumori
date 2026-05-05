'use client';

import Engine from '@/components/arcade/Engine';
import { STANDALONE_GAMES } from '@/components/arcade/registry';

export default function MaidCafeManagerInCard() {
  const game = STANDALONE_GAMES['maid-cafe-manager'];
  return (
    <div className="w-full p-3">
      <Engine playlist={[game]} mode="long" autoplay={false} />
    </div>
  );
}
