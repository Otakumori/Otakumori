"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getEnabledGames, GameDefinition } from '@/app/lib/games';
import { playSfx, setMuted, isMuted } from '@/app/lib/assets';
import RippleBackdrop from '@/components/effects/RippleBackdrop';

interface GameTileProps {
  game: GameDefinition;
  onPlay: (gameKey: string) => void;
}

function GameTile({ game, onPlay }: GameTileProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    playSfx('ui-click');
    onPlay(game.key);
  };

  return (
    <div
      className={`
        relative group cursor-pointer transform transition-all duration-300
        bg-gradient-to-br from-pink-50 to-gray-100 
        border-2 border-pink-200 rounded-xl p-6
        hover:scale-105 hover:shadow-lg hover:shadow-pink-200/50
        ${isHovered ? 'ring-2 ring-pink-300' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Difficulty Badge */}
      <div className={`
        absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium
        ${game.difficulty === 'easy' ? 'bg-green-100 text-green-700' : ''}
        ${game.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
        ${game.difficulty === 'hard' ? 'bg-red-100 text-red-700' : ''}
      `}>
        {game.difficulty}
      </div>

      {/* Game Icon */}
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
        <span className="text-2xl">🎮</span>
      </div>

      {/* Game Title */}
      <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">
        {game.name}
      </h3>

      {/* Tagline */}
      <p className="text-sm text-gray-600 text-center mb-4 italic">
        {game.tagline}
      </p>

      {/* How to Play */}
      <p className="text-xs text-gray-500 text-center mb-4">
        {game.howToPlay}
      </p>

      {/* Max Reward */}
      <div className="text-center">
        <span className="text-xs text-gray-500">Max Reward:</span>
        <div className="flex items-center justify-center gap-1 mt-1">
          <span className="text-pink-500 font-semibold">{game.maxRewardPerRun}</span>
          <span className="text-xs text-pink-400">🌸</span>
        </div>
      </div>

      {/* Play Button */}
      <button
        className={`
          w-full mt-4 py-2 px-4 rounded-lg font-medium transition-all duration-200
          bg-gradient-to-r from-pink-400 to-purple-400 text-white
          hover:from-pink-500 hover:to-purple-500
          active:scale-95 transform
        `}
      >
        Play Now
      </button>

      {/* Hover Effects */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-purple-100/20 rounded-xl pointer-events-none" />
      )}
    </div>
  );
}

export default function MiniGamesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [games, setGames] = useState<GameDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      const enabledGames = getEnabledGames();
      setGames(enabledGames);
      setIsLoading(false);
      
      // Load user preferences
      setSfxMuted(isMuted());
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, [isLoaded]);

  const handlePlayGame = (gameKey: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    router.push(`/mini-games/${gameKey}`);
  };

  const toggleSfx = () => {
    const newMuted = !sfxMuted;
    setSfxMuted(newMuted);
    setMuted(newMuted);
    playSfx('ui-click');
  };

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
    // Apply reduced motion to the page
    document.documentElement.style.setProperty(
      '--reduced-motion',
      (!reducedMotion).toString()
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mini-games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Background Effects */}
      {!reducedMotion && <RippleBackdrop durationMs={8000} strength={0.6} />}

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <span className="text-xl">←</span>
              <span>Back</span>
            </button>

            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-800">
              Mini-Games Hub
            </h1>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* SFX Toggle */}
              <button
                onClick={toggleSfx}
                className={`
                  p-2 rounded-lg transition-colors
                  ${sfxMuted 
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' 
                    : 'bg-pink-200 text-pink-600 hover:bg-pink-300'
                  }
                `}
                title={sfxMuted ? 'Unmute SFX' : 'Mute SFX'}
              >
                {sfxMuted ? '🔇' : '🔊'}
              </button>

              {/* Reduced Motion Toggle */}
              <button
                onClick={toggleReducedMotion}
                className={`
                  p-2 rounded-lg transition-colors
                  ${reducedMotion 
                    ? 'bg-blue-200 text-blue-600 hover:bg-blue-300' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }
                `}
                title={reducedMotion ? 'Enable Motion' : 'Reduce Motion'}
              >
                {reducedMotion ? '🚫' : '🎬'}
              </button>

              {/* Petal Counter */}
              {user && (
                <div className="flex items-center gap-2 bg-pink-100 px-3 py-2 rounded-lg">
                  <span className="text-pink-600 font-semibold">🌸</span>
                  <span className="text-sm text-pink-700">
                    {(user.publicMetadata as any)?.petalBalance || 0}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to the Mini-Games Hub!
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our collection of arcade-style mini-games. Each game offers unique challenges 
            and rewards. Complete games to earn petals and unlock achievements!
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameTile
              key={game.key}
              game={game}
              onPlay={handlePlayGame}
            />
          ))}
        </div>

        {/* No Games Available */}
        {games.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Games Available
            </h3>
            <p className="text-gray-500">
              Check back later for new mini-games!
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p className="mb-2">
            Daily petal limit: {process.env.NEXT_PUBLIC_DAILY_PETAL_LIMIT || 500} 🌸
          </p>
          <p>
            Event: {process.env.NEXT_PUBLIC_EVENT_CODE || 'SPRING_HANAMI'} 🌸
          </p>
        </div>
      </main>
    </div>
  );
}
