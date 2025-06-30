'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';

interface GameCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  blocks: number; // Memory card blocks
  lastPlayed?: string;
  isNew?: boolean;
}

const games: GameCard[] = [
  {
    id: 'petal-samurai',
    title: 'Petal Samurai',
    description: 'Slice falling petals with calm precision',
    icon: '/assets/images/petal-cherry.png', // Use your new petal PNGs
    route: '/minigames/petal-samurai',
    blocks: 8,
    lastPlayed: '2 hours ago',
  },
  {
    id: 'brick-breaker',
    title: 'Brick Breaker',
    description: 'Break all the bricks with your paddle',
    icon: '/assets/images/brick-icon.png',
    route: '/minigames/brick-breaker',
    blocks: 12,
    lastPlayed: '1 day ago',
  },
  {
    id: 'memory-matrix',
    title: 'Memory Matrix',
    description: 'Match cards before time runs out',
    icon: '/assets/images/memory-card.png',
    route: '/minigames/memory-matrix',
    blocks: 6,
    lastPlayed: '3 days ago',
  },
  {
    id: 'bento-boss',
    title: 'Bento Boss',
    description: 'Stack ingredients for perfect bento',
    icon: '/assets/images/bento-icon.png',
    route: '/minigames/bento-boss',
    blocks: 10,
    lastPlayed: '5 days ago',
  },
  {
    id: 'bubble-girl',
    title: 'Bubble Girl',
    description: 'Pop bubbles with the floating anime girl',
    icon: '/assets/images/bubble-girl.png',
    route: '/minigames/bubble-girl',
    blocks: 15,
    isNew: true,
  },
  {
    id: 'glitch-crawl',
    title: 'Glitch Crawl',
    description: 'Navigate through corrupted data world',
    icon: '/assets/images/glitch-icon.png',
    route: '/minigames/glitch-crawl',
    blocks: 20,
  },
  {
    id: 'thighs-of-time',
    title: 'Thighs of Time',
    description: 'Rhythm game with dancing anime characters',
    icon: '/assets/images/rhythm-icon.png',
    route: '/minigames/thighs-of-time',
    blocks: 18,
  },
  {
    id: 'love-letter-duel',
    title: 'Love Letter Duel',
    description: 'Assemble poetic anime messages',
    icon: '/assets/images/love-letter.png',
    route: '/minigames/love-letter-duel',
    blocks: 7,
  },
  {
    id: 'maid-mayhem',
    title: 'Maid Mayhem',
    description: 'Time management with flustered maid',
    icon: '/assets/images/maid-icon.png',
    route: '/minigames/maid-mayhem',
    blocks: 14,
  },
  {
    id: 'otaku-drift',
    title: 'Otaku Drift',
    description: 'Drift through anime-themed lanes',
    icon: '/assets/images/drift-icon.png',
    route: '/minigames/otaku-drift',
    blocks: 16,
  },
  {
    id: 'rune-alchemy',
    title: 'Rune Alchemy',
    description: 'Match-3 with Otaku-mori runes',
    icon: '/assets/images/rune-icon.png',
    route: '/minigames/rune-alchemy',
    blocks: 22,
  },
];

export default function MinigamesPage() {
  const [selectedGame, setSelectedGame] = useState<GameCard | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'blocks' | 'lastPlayed'>('name');

  const sortedGames = [...games].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'blocks':
        return b.blocks - a.blocks;
      case 'lastPlayed':
        return a.lastPlayed ? (b.lastPlayed ? 0 : -1) : 1;
      default:
        return 0;
    }
  });

  const totalBlocks = games.reduce((sum, game) => sum + game.blocks, 0);
  const maxBlocks = 1019; // GameCube memory card capacity

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800">
      <Header />

      <div className="p-8">
        {/* GameCube Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 shadow-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400">
              <span className="text-sm font-bold text-black">GC</span>
            </div>
            <h1 className="text-2xl font-bold tracking-wider text-white">OTKU-MORI GAME CUBE</h1>
            <div className="font-mono text-sm text-yellow-400">Memory Card A</div>
          </div>
        </div>

        {/* Memory Card Info */}
        <div className="mb-6 rounded-lg border border-purple-400 bg-black/30 p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-12 items-center justify-center rounded border-2 border-white bg-gradient-to-r from-purple-500 to-blue-500">
                <span className="text-xs font-bold">GC</span>
              </div>
              <div>
                <div className="font-bold">OTKU-MORI Memory Card</div>
                <div className="text-sm text-gray-300">
                  {totalBlocks} / {maxBlocks} blocks used
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">Format: GC</div>
              <div className="text-sm text-gray-300">Region: NTSC</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 rounded-full bg-gray-700">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
              style={{ width: `${(totalBlocks / maxBlocks) * 100}%` }}
            />
          </div>
        </div>

        {/* Sort Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setSortBy('name')}
              className={`rounded border-2 px-4 py-2 transition-colors ${
                sortBy === 'name'
                  ? 'border-purple-400 bg-purple-600 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-purple-400'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('blocks')}
              className={`rounded border-2 px-4 py-2 transition-colors ${
                sortBy === 'blocks'
                  ? 'border-purple-400 bg-purple-600 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-purple-400'
              }`}
            >
              Blocks
            </button>
            <button
              onClick={() => setSortBy('lastPlayed')}
              className={`rounded border-2 px-4 py-2 transition-colors ${
                sortBy === 'lastPlayed'
                  ? 'border-purple-400 bg-purple-600 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-purple-400'
              }`}
            >
              Last Played
            </button>
          </div>
          <div className="text-sm text-white">{games.length} games available</div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedGames.map(game => (
            <Link key={game.id} href={game.route}>
              <div
                className={`game-card relative cursor-pointer rounded-lg border-2 bg-gradient-to-br from-purple-800 to-blue-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  selectedGame?.id === game.id
                    ? 'border-yellow-400 shadow-yellow-400/50'
                    : 'border-purple-400 hover:border-yellow-400'
                }`}
                onMouseEnter={() => setSelectedGame(game)}
                onMouseLeave={() => setSelectedGame(null)}
              >
                {/* New Badge */}
                {game.isNew && (
                  <div className="absolute -right-2 -top-2 z-10 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                    NEW
                  </div>
                )}

                {/* Game Icon */}
                <div className="p-4 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg border-2 border-white bg-gradient-to-br from-purple-600 to-blue-600">
                    <Image
                      src={game.icon}
                      alt={game.title}
                      width={48}
                      height={48}
                      className="rounded"
                      onError={e => {
                        // Fallback to text if image fails
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.textContent = game.title.charAt(0);
                      }}
                    />
                    <span className="hidden text-xl font-bold text-white">
                      {game.title.charAt(0)}
                    </span>
                  </div>

                  <h3 className="mb-1 text-lg font-bold text-white">{game.title}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-300">{game.description}</p>
                </div>

                {/* Game Info */}
                <div className="rounded-b-lg border-t border-purple-600 bg-black/30 p-3">
                  <div className="flex items-center justify-between text-sm text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <span>{game.blocks} blocks</span>
                    </div>
                    {game.lastPlayed && (
                      <span className="text-xs text-gray-400">{game.lastPlayed}</span>
                    )}
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedGame?.id === game.id && (
                  <div className="pointer-events-none absolute inset-0 animate-pulse rounded-lg border-2 border-yellow-400" />
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <div className="mb-2 flex items-center justify-center gap-4">
            <span>Press A to select</span>
            <span>•</span>
            <span>Press B to go back</span>
            <span>•</span>
            <span>Press X to sort</span>
          </div>
          <div className="text-xs">
            Nintendo GameCube Memory Card Interface - Otaku-mori Games Collection
          </div>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .game-card {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .game-card:hover {
          box-shadow: 0 8px 40px rgba(139, 69, 19, 0.4);
        }
      `}</style>
    </main>
  );
}
