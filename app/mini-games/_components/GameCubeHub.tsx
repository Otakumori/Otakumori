'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { initInput } from './InputController';
import FaceLabel from './FaceLabel';

const ConsoleCard = dynamic(() => import('../console/ConsoleCard'), { ssr: false });

// Map of game metadata icons to ASCII-style representations
const iconMap: Record<string, string> = {
  swords: '><',
  psychology: '[@]',
  bubble_chart: '(.)',
  music_note: '♪',
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

// ALL available games from games.meta.json
const allGames = [
  {
    id: 'samurai-petal-slice',
    label: 'Samurai Petal Slice',
    desc: "Draw the Tetsusaiga's arc…",
    href: '/mini-games/samurai-petal-slice',
    icon: iconMap.swords,
    status: 'available',
  },
  {
    id: 'anime-memory-match',
    label: 'Anime Memory Match',
    desc: 'Recall the faces bound by fate.',
    href: '/mini-games/anime-memory-match',
    icon: iconMap.psychology,
    status: 'available',
  },
  {
    id: 'bubble-pop-gacha',
    label: 'Bubble-Pop Gacha',
    desc: 'Pop for spy-craft secrets…',
    href: '/mini-games/bubble-pop-gacha',
    icon: iconMap.bubble_chart,
    status: 'available',
  },
  {
    id: 'rhythm-beat-em-up',
    label: 'Rhythm Beat-Em-Up',
    desc: "Sync to the Moon Prism's pulse.",
    href: '/mini-games/rhythm-beat-em-up',
    icon: iconMap.music_note,
    status: 'available',
  },
  {
    id: 'petal-collection',
    label: 'Petal Collection',
    desc: 'Collect falling petals and rack up combos.',
    href: '/mini-games/petal-collection',
    icon: iconMap.spa,
    status: 'available',
  },
  {
    id: 'memory-match',
    label: 'Memory Match',
    desc: 'Flip cards and match pairs. Perfect recall earns bonuses.',
    href: '/mini-games/memory-match',
    icon: iconMap.grid_view,
    status: 'available',
  },
  {
    id: 'bubble-girl',
    label: 'Bubble Girl',
    desc: 'Spawn bubbles, float and score. Sandbox or challenge mode.',
    href: '/mini-games/bubble-girl',
    icon: iconMap.bubble_chart,
    status: 'available',
  },
  {
    id: 'petal-storm-rhythm',
    label: 'Petal Storm Rhythm',
    desc: 'Stormy rhythm playlist—precision timing for petals.',
    href: '/mini-games/petal-storm-rhythm',
    icon: iconMap.thunderstorm,
    status: 'available',
  },
  {
    id: 'bubble-ragdoll',
    label: 'Bubble Ragdoll',
    desc: 'Toss the ragdoll into bubbles. Survive the chaos.',
    href: '/mini-games/bubble-ragdoll',
    icon: iconMap.toys,
    status: 'available',
  },
  {
    id: 'blossomware',
    label: 'Blossomware Playlist',
    desc: 'Chaotic micro-sessions—keep your petal streak alive.',
    href: '/mini-games/blossomware',
    icon: iconMap.playlist_play,
    status: 'available',
  },
  {
    id: 'dungeon-of-desire',
    label: 'Dungeon of Desire',
    desc: 'Descend into the dungeon. Survive rooms and claim rewards.',
    href: '/mini-games/dungeon-of-desire',
    icon: iconMap.skull,
    status: 'available',
  },
  {
    id: 'maid-cafe-manager',
    label: 'Maid Cafe Manager',
    desc: 'Manage shifts and keep guests smiling.',
    href: '/mini-games/maid-cafe-manager',
    icon: iconMap.local_cafe,
    status: 'available',
  },
  {
    id: 'thigh-coliseum',
    label: 'Thigh Coliseum',
    desc: 'Enter the arena. Win rounds and advance the bracket.',
    href: '/mini-games/thigh-coliseum',
    icon: iconMap.stadium,
    status: 'available',
  },
  {
    id: 'quick-math',
    label: 'Quick Math',
    desc: 'Answer fast. Pressure builds with each correct streak.',
    href: '/mini-games/quick-math',
    icon: iconMap.calculate,
    status: 'available',
  },
  {
    id: 'puzzle-reveal',
    label: 'Puzzle Reveal',
    desc: 'Clear the fog to reveal the art. Watch your energy.',
    href: '/mini-games/puzzle-reveal',
    icon: iconMap.extension,
    status: 'available',
  },
  {
    id: 'petal-samurai',
    label: 'Petal Samurai',
    desc: 'Slash petals with style. Master storm and endless modes.',
    href: '/mini-games/petal-samurai',
    icon: iconMap.swords,
    status: 'available',
  },
];

const GAMES_PER_PAGE = 6; // Show 6 games at a time in a 2x3 grid

export default function GameCubeHub() {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showGamesList, setShowGamesList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const totalPages = Math.ceil(allGames.length / GAMES_PER_PAGE);
  const currentGames = allGames.slice(
    currentPage * GAMES_PER_PAGE,
    (currentPage + 1) * GAMES_PER_PAGE,
  );
  const activeGame = currentGames[selectedIdx];

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const cleanup = initInput(node, {
      onRotateLeft: () => {
        if (showGamesList) {
          setShowGamesList(false);
        } else {
          setCurrentPage((p) => (p + totalPages - 1) % totalPages);
        }
      },
      onRotateRight: () => {
        if (showGamesList) {
          setShowGamesList(false);
        } else {
          setCurrentPage((p) => (p + 1) % totalPages);
        }
      },
      onSelect: () => {
        if (showGamesList) {
          setShowGamesList(false);
        } else {
          setShowGamesList(true);
        }
      },
      onBack: () => {
        if (showGamesList) {
          setShowGamesList(false);
        } else {
          setCurrentPage(0);
        }
      },
    });
    return cleanup;
  }, [showGamesList, totalPages]);

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setSelectedIdx(0);
    } else if (direction === 'next' && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setSelectedIdx(0);
    }
  };

  const listboxId = useMemo(() => `faces_${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <section
      ref={containerRef}
      tabIndex={0}
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
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(79, 70, 229, 0.2) 0%, transparent 50%),
              linear-gradient(rgba(147, 51, 234, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '600px 600px, 800px 800px, 60px 60px, 60px 60px',
          }}
        />
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
              setSelectedIdx(0);
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
              setSelectedIdx(0);
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
              setSelectedIdx(0);
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
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allGames.map((game, i) => (
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
