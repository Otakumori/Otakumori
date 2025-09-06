'use client';

import Link from 'next/link';

export function MiniGamesTeaser() {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">Mini-Games</h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-300 leading-relaxed mb-8">
            Test your skills in our collection of mini-games.
          </p>
          <Link 
            href="/mini-games" 
            className="inline-block bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg transition-colors"
          >
            Play Games
          </Link>
        </div>
      </div>
    </section>
  );
}