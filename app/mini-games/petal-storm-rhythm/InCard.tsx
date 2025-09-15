'use client';

import Engine from '@/components/arcade/Engine';
import { STANDALONE_GAMES } from '@/components/arcade/registry';

export default function PetalStormRhythmInCard() {
  const game = STANDALONE_GAMES['petal-storm-rhythm'];
  return (
    <div className="w-full p-3">
      <Engine playlist={[game]} mode="long" autoplay={false} />
    </div>
  );
}
