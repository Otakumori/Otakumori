'use client';

import Link from 'next/link';
import Image from 'next/image';

export function MiniGamesTeaser() {
  return (
    <section id="mini-games-teaser" className="bg-gradient-to-br from-indigo-50 to-purple-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800">Mini-Games Hub</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Test your skills, collect petals, and unlock hidden treasures in our pixel-perfect
            mini-games.
          </p>
        </div>

        <div className="mx-auto max-w-md">
          <Link href="/mini-games" className="group block">
            <div className="relative transform overflow-hidden rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105">
              <div className="relative h-64 bg-gradient-to-br from-purple-600 to-pink-600">
                <Image
                  src="/minigames/cover-provocative.webp"
                  alt="Mini-games cover"
                  fill
                  className="object-cover mix-blend-overlay"
                  priority
                />
                <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="mb-2 text-4xl">🎮</div>
                    <h3 className="mb-2 text-2xl font-bold">Enter the Arena</h3>
                    <p className="text-sm opacity-90">Click to explore</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
