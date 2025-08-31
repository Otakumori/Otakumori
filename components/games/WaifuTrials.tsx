/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { useState } from 'react';

export default function WaifuTrials() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-blue-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Waifu Trials</h1>
        <p className="text-xl mb-8">Prove your devotion.</p>
        <div className="text-2xl mb-4">Score: {score}</div>
        <button
          className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg font-bold"
          onClick={() => setScore(score + 1)}
        >
          Trial!
        </button>
      </div>
    </div>
  );
}
