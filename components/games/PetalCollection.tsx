 
 
'use client';

import { type GameDefinition } from '@/app/lib/games';

interface PetalCollectionProps {
  gameDef: GameDefinition;
}

export default function PetalCollection({ gameDef }: PetalCollectionProps) {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center">
        <div className="text-6xl mb-4">🌸</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{gameDef.name}</h3>
        <p className="text-gray-500 mb-4">{gameDef.howToPlay}</p>
        <div className="text-sm text-gray-400">Coming Soon! 🚧</div>
        <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
          Prototype - Economy Pacing
        </div>
      </div>
    </div>
  );
}
