'use client';

import { type GameDefinition } from '@/app/lib/games';

interface AnimeMemoryMatchProps {
  gameDef: GameDefinition;
}

export default function AnimeMemoryMatch({ gameDef }: AnimeMemoryMatchProps) {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center">
        <div className="text-6xl mb-4">
          <span role="img" aria-label="Playing cards">
            🎴
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{gameDef.name}</h3>
        <p className="text-gray-500 mb-4">{gameDef.howToPlay}</p>
        <div className="text-sm text-gray-400">
          Coming Soon!{' '}
          <span role="img" aria-label="Construction">
            🚧
          </span>
        </div>
      </div>
    </div>
  );
}
