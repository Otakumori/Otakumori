'use client';

/**
 * Rhythm Beat-Em-Up Scene Component
 * Placeholder for the game scene - implement your game logic here
 */

interface SceneProps {
  mapUrl?: string;
}

export default function Scene({ mapUrl }: SceneProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-purple-900 to-black rounded-lg border border-pink-500/30">
      <div className="text-center text-white/70">
        <p className="text-2xl mb-2">Rhythm Beat-Em-Up</p>
        <p className="text-sm">Game scene under construction</p>
        {mapUrl && <p className="text-xs mt-2">Map: {mapUrl}</p>}
      </div>
    </div>
  );
}
