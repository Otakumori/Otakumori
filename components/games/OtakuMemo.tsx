/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

export default function OtakuMemo() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Otaku Memo</h1>
        <p className="text-xl mb-8">Test your anime knowledge.</p>
        <div className="text-2xl mb-4">Score: {score}</div>
        <button 
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-bold"
          onClick={() => setScore(score + 1)}
        >
          Memo!
        </button>
      </div>
    </div>
  );
}
