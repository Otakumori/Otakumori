'use client';

import { useState } from 'react';
import GameShell from '../_shared/GameShell';

);
}
export default function BubblePopGachaPage() {
  const [shards, setShards] = useState(0);
  const [perks, setPerks] = useState<string[]>([]);
  const [bubbles, setBubbles] = useState(0);

  const popBubble = () => {
    setBubbles((prev) => prev + 1);

    // 20% chance to get a shard
    if (Math.random() < 0.2) {
      setShards((prev) => prev + 1);
    }
  };

  const craftPerk = () => {
    if (shards >= 5) {
      const availablePerks = [
        'Faster Bubbles',
        'Double Pop',
        'Shard Magnet',
        'Lucky Star',
        'Bubble Shield',
      ];

      const newPerk = availablePerks[Math.floor(Math.random() * availablePerks.length)];
      setPerks((prev) => [...prev, newPerk]);
      setShards((prev) => prev - 5);
    }
  };

  return (
    <GameShell title="Bubble-Pop Gacha" gameKey="bubble-pop-gacha">
      <div className="w-full h-full bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-900 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Stats */}
          <div className="flex justify-between items-center mb-6 text-white">
            <div>Bubbles Popped: {bubbles}</div>
            <div>Shards: {shards}</div>
            <div>Perks: {perks.length}</div>
          </div>

          {/* Main Game Area */}
          <div className="bg-black/20 rounded-2xl p-8 text-center mb-6">
            <div
              className="text-8xl cursor-pointer hover:scale-110 transition-transform duration-200 inline-block"
              onClick={popBubble}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && popBubble()}
              aria-label="Pop bubble"
            ></div>
            <p className="text-cyan-200 mt-4">Click the bubble to pop it!</p>
          </div>

          {/* Crafting */}
          <div className="bg-white/10 rounded-2xl p-6 mb-6">
            <h3 className="text-white text-xl font-bold mb-4">Craft Perks</h3>
            <p className="text-cyan-200 mb-4">Cost: 5 shards per perk</p>
            <button
              onClick={craftPerk}
              disabled={shards < 5}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              Craft Random Perk ({shards}/5)
            </button>
          </div>

          {/* Perks Collection */}
          {perks.length > 0 && (
            <div className="bg-white/10 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">Your Perks</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {perks.map((perk, index) => (
                  <div
                    key={index}
                    className="bg-purple-600/30 rounded-lg p-2 text-center text-white text-sm"
                  >
                    {perk}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-sm text-cyan-300">
              I didn't lose. Just ran out of health. – Edward Elric
            </p>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
