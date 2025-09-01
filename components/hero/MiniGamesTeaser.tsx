 
 
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, Trophy, Sparkles, Zap } from 'lucide-react';

export function MiniGamesTeaser() {
  return (
    <section
      id="mini-games-teaser"
      className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-20 relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-16 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-white/10 p-4 backdrop-blur-sm">
              <Gamepad2 className="h-12 w-12 text-white" />
            </div>
          </div>

          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Mini-Games Hub</h2>

          <p className="mx-auto max-w-3xl text-xl text-purple-100 leading-relaxed">
            Where cherry blossoms meet pixel art. Test your skills, collect petals, and unlock
            hidden treasures in our pixel-perfect mini-games.
            <span className="block mt-2 text-lg text-purple-200">
              Each game is a meditation, each victory a moment of zen.
            </span>
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <Link href="/mini-games" className="group block">
            <div className="relative transform overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-purple-500/25">
              {/* Main game hub entry */}
              <div className="relative h-80 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.1)_2px,transparent_0)] bg-[length:40px_40px]" />
                </div>

                {/* Floating game icons */}
                <div className="absolute top-8 left-8 animate-bounce">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div
                  className="absolute top-16 right-12 animate-bounce"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div
                  className="absolute bottom-16 left-16 animate-bounce"
                  style={{ animationDelay: '1s' }}
                >
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Main content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="mb-4 text-6xl">🎮</div>
                    <h3 className="mb-3 text-3xl font-bold">Enter the Arena</h3>
                    <p className="mb-4 text-lg text-purple-100 opacity-90">
                      Click to explore the digital shrine
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur-sm">
                      <span>6 Games Available</span>
                      <span>•</span>
                      <span>Petal Rewards</span>
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />
              </div>
            </div>
          </Link>
        </div>

        {/* Game preview grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm text-center">
            <div className="mb-3 text-3xl">⚔️</div>
            <h4 className="mb-2 text-lg font-semibold text-white">Samurai Petal Slice</h4>
            <p className="text-sm text-purple-200">Draw the Tetsusaiga's arc with precision</p>
          </div>

          <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm text-center">
            <div className="mb-3 text-3xl">🧠</div>
            <h4 className="mb-2 text-lg font-semibold text-white">Memory Match</h4>
            <p className="text-sm text-purple-200">Recall the faces bound by fate</p>
          </div>

          <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm text-center">
            <div className="mb-3 text-3xl">🫧</div>
            <h4 className="mb-2 text-lg font-semibold text-white">Bubble Pop Gacha</h4>
            <p className="text-sm text-purple-200">Pop for spy-craft secrets</p>
          </div>
        </div>
      </div>
    </section>
  );
}
