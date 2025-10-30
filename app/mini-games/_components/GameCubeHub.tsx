'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { initInput } from './InputController';
import { getEnabledGames, type GameDefinition } from '../_data/registry.safe';
import GameCubeBoot3D from './GameCubeBoot3D';
import GameCubeMemoryCard from './GameCubeMemoryCard';
import { createAchievementSystem } from '../_engine/AchievementSystem';
import { createLeaderboardSystem } from '../_engine/LeaderboardSystem';
import { createSaveSystem } from '../_engine/SaveSystem';

// const ConsoleCard = dynamic(() => import('../console/ConsoleCard'), { ssr: false });
const SettingsConsole = dynamic(() => import('./SettingsConsole.safe'), { ssr: false });

// Map of game metadata icons to ASCII-style representations
const iconMap: Record<string, string> = {
  swords: '><',
  psychology: '[@]',
  bubble_chart: '(.)',
  music_note: '',
  spa: '*',
  grid_view: '[]',
  thunderstorm: '~',
  toys: 'o',
  playlist_play: '≡',
  skull: 'x',
  local_cafe: 'U',
  stadium: '()',
  calculate: '#',
  extension: '+',
};

// Convert registry games to hub format
const allGames = getEnabledGames().map((game: GameDefinition) => ({
  id: game.id,
  label: game.title,
  desc: game.description,
  href: `/mini-games/${game.slug}`,
  icon: iconMap[game.icon as keyof typeof iconMap] || iconMap.grid_view,
  status: game.status === 'ready' ? 'available' : game.status,
}));

const GAMES_PER_PAGE = 6; // Show 6 games at a time in a 2x3 grid

export default function GameCubeHub() {
  const [currentPage, setCurrentPage] = useState(0);
  const [showGamesList, setShowGamesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBootScreen, setShowBootScreen] = useState(true);
  const [showMemoryCard, setShowMemoryCard] = useState(false);
  const [currentSaveData, setCurrentSaveData] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const active = faces[idx] ?? faces[0] ?? null;

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const cleanup = initInput(node, {
      onRotateLeft: () => setIdx((i) => (i + faces.length - 1) % faces.length),
      onRotateRight: () => setIdx((i) => (i + 1) % faces.length),
      onSelect: () => {
        if (active) {
          router.push(active.href);
        }
      },
      onBack: () => setIdx(0),
    });
    return cleanup;
  }, [active, router]);

  // const handlePageChange = (direction: 'prev' | 'next') => {
  //   if (direction === 'prev' && currentPage > 0) {
  //     setCurrentPage(currentPage - 1);
  //     setSelectedIdx(0);
  //   } else if (direction === 'next' && currentPage < totalPages - 1) {
  //     setCurrentPage(currentPage + 1);
  //     setSelectedIdx(0);
  //   }
  // };

  // Show boot screen if needed
  if (showBootScreen) {
    return <GameCubeBoot3D onComplete={handleBootComplete} onSkip={handleBootSkip} />;
  }

  // Show memory card if needed
  if (showMemoryCard) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <GameCubeMemoryCard
            onInsert={handleMemoryCardInsert}
            onEject={handleMemoryCardEject}
            isInserted={false}
            saveData={currentSaveData}
          />
        </div>
      </div>
    );
  }

  return (
    <section
      ref={containerRef}
      tabIndex={-1}
      data-gamecube-active="true"
      className="relative isolate z-0 mx-auto w-full max-w-[1200px] h-[min(85vh,95svh)] overflow-hidden outline-none"
      style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #312e81 25%, #1e1b4b 50%, #0f0f23 100%)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Authentic GameCube background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="flex max-w-[720px] flex-wrap items-center justify-center gap-2"
          role="listbox"
          aria-activedescendant={active ? `${listboxId}_${active.id}` : undefined}
        >
          {faces.map((f, i) => (
            <FaceLabel
              key={f.id}
              id={`${listboxId}_${f.id}`}
              label={f.label}
              href={f.href}
              active={i === idx}
            />
          ))}
        </div>
      </div>

      {/* Authentic GameCube Main Face UI */}
      <div className="relative z-10 h-full flex items-center justify-center">
        {/* Main GameCube Face - Centered empty container with face labels */}
        <div className="relative w-96 h-96">
          {/* Central Empty Area (like real GameCube main face) */}
          <div className="absolute inset-12 bg-gradient-to-br from-black/40 to-black/60 rounded-2xl border border-purple-300/20 backdrop-blur-sm">
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <h1
                className="text-2xl font-bold text-white tracking-wider mb-2"
                style={{ fontFamily: 'Roboto Condensed, sans-serif' }}
              >
                OTAKU-MORI
              </h1>
              <p className="text-purple-200 text-sm mb-4">Select a face to navigate</p>
              <div className="text-xs text-purple-300 opacity-75">
                {allGames.length} Games Available
              </div>
            </div>
          </div>

          {/* Face Labels positioned around the empty center (like GameCube) */}

          {/* Top Face */}
          <button
            onClick={() => {
              setCurrentPage(0);
            }}
            className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 
              px-4 py-2 bg-gradient-to-b from-purple-500/30 to-purple-600/40 
              rounded-lg border border-purple-300/30 text-white text-sm
              hover:from-purple-400/40 hover:to-purple-500/50 transition-all duration-300
              ${currentPage === 0 ? 'ring-2 ring-pink-400 ring-opacity-60' : ''}
            `}
          >
            <div className="text-center">
              <div className="text-lg mb-1">{allGames[0]?.icon}</div>
              <div className="text-xs">Action</div>
            </div>
          </button>

          {/* Right Face */}
          <button
            onClick={() => {
              setCurrentPage(1);
            }}
            className={`absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 
              px-4 py-2 bg-gradient-to-l from-purple-500/30 to-purple-600/40 
              rounded-lg border border-purple-300/30 text-white text-sm
              hover:from-purple-400/40 hover:to-purple-500/50 transition-all duration-300
              ${currentPage === 1 ? 'ring-2 ring-pink-400 ring-opacity-60' : ''}
            `}
          >
            <div className="text-center">
              <div className="text-lg mb-1">{allGames[6]?.icon}</div>
              <div className="text-xs">Puzzle</div>
            </div>
          </button>

          {/* Bottom Face */}
          <button
            onClick={() => {
              setCurrentPage(2);
            }}
            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 
              px-4 py-2 bg-gradient-to-t from-purple-500/30 to-purple-600/40 
              rounded-lg border border-purple-300/30 text-white text-sm
              hover:from-purple-400/40 hover:to-purple-500/50 transition-all duration-300
              ${currentPage === 2 ? 'ring-2 ring-pink-400 ring-opacity-60' : ''}
            `}
          >
            <div className="text-center">
              <div className="text-lg mb-1">{allGames[12]?.icon}</div>
              <div className="text-xs">Strategy</div>
            </div>
          </button>

          {/* Left Face */}
          <button
            onClick={() => {
              // Show current page games in a modal or overlay
              setShowGamesList(true);
            }}
            className={`absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2 
              px-4 py-2 bg-gradient-to-r from-purple-500/30 to-purple-600/40 
              rounded-lg border border-purple-300/30 text-white text-sm
              hover:from-purple-400/40 hover:to-purple-500/50 transition-all duration-300
            `}
          >
            <div className="text-center">
              <div className="text-lg mb-1">≡</div>
              <div className="text-xs">All Games</div>
            </div>
          </button>

          {/* Memory Card Slot */}
          <button
            onClick={() => setShowMemoryCard(true)}
            className="absolute right-4 bottom-4 w-16 h-12 bg-gradient-to-br from-gray-700/50 to-gray-800/50 
              rounded-lg border border-gray-600/30 text-white text-xs
              hover:from-gray-600/60 hover:to-gray-700/60 transition-all duration-300
              flex items-center justify-center group"
            title="Memory Card Slot"
          >
            <div className="text-center">
              <div className="text-lg mb-1 group-hover:scale-110 transition-transform">
                <span role="img" aria-label="Memory card">
                  💾
                </span>
              </div>
              <div className="text-xs opacity-75">MC</div>
            </div>
          </button>

          {/* Navigation hints in corners */}
          <div className="absolute top-2 right-2 text-xs text-purple-300 opacity-60">
            {currentPage + 1}/{totalPages}
          </div>

          <div className="absolute bottom-2 left-2 text-xs text-purple-300 opacity-60">
            Use D-pad to navigate
          </div>
        </div>

        {/* Games List Overlay */}
        {showGamesList && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-900/90 to-black/90 rounded-2xl border border-purple-300/30 p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">All Games</h2>
                <button
                  onClick={() => setShowGamesList(false)}
                  className="text-purple-300 hover:text-white transition-colors text-xl"
                ></button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allGames.map((game, _i) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      router.push(game.href);
                      setShowGamesList(false);
                    }}
                    className="p-4 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl border border-purple-400/30 
                               hover:from-purple-500/30 hover:to-purple-700/30 hover:border-purple-300/50 
                               transition-all duration-300 text-left group"
                  >
                    <div className="text-2xl mb-2">{game.icon}</div>
                    <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-pink-300 transition-colors">
                      {game.label}
                    </h3>
                    <p className="text-purple-200 text-xs leading-relaxed opacity-80">
                      {game.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-300 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `sparkle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Settings Console - No Disc Inserted */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50">
          <SettingsConsole
            onVolumeChange={(_volume) => {
              // Handle volume change - TODO: implement volume control
            }}
            onThemeChange={(_theme) => {
              // Handle theme change - TODO: implement theme switching
            }}
            className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          />
          <button
            onClick={() => setShowSettings(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>
      )}

      {/* Add CSS for line clamping */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `,
        }}
      />
    </section>
  );
}
