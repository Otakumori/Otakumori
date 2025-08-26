/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { GameDefinition } from '@/app/lib/games';

interface QuickMathProps {
  gameDef: GameDefinition;
}

export default function QuickMath({ gameDef }: QuickMathProps) {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center">
        <div className="text-6xl mb-4">🧮</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {gameDef.name}
        </h3>
        <p className="text-gray-500 mb-4">
          {gameDef.howToPlay}
        </p>
        <div className="text-sm text-gray-400">
          Coming Soon! 🚧
        </div>
      </div>
    </div>
  );
}
