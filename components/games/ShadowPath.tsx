'use client';

import { useState } from 'react';

export default function ShadowPath() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Shadow Path</h1>
        <p className="text-xl mb-8">Navigate through darkness.</p>
        <div className="text-2xl mb-4">Score: {score}</div>
        <button
          className="bg-slate-600 hover:bg-slate-700 px-6 py-3 rounded-lg font-bold"
          onClick={() => setScore(score + 1)}
        >
          Navigate!
        </button>
      </div>
    </div>
  );
}
