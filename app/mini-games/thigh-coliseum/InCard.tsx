'use client';

import Engine from '@/components/arcade/Engine';
import { STANDALONE_GAMES } from '@/components/arcade/registry';

export default function ThighColiseumInCard() {
  const game = STANDALONE_GAMES['thigh-coliseum'];
  return (
    <div className="w-full p-3">
      <Engine playlist={[game]} mode="long" autoplay={false} />
    </div>
  );
}
