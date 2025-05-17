'use client';
import Header from '../../components/Header';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import PetalCollector from '../../components/PetalCollector';
import Achievements from '../../components/Achievements';
import TradeCraft from '../../components/TradeCraft';

const MENU_ITEMS = [
  {
    id: 'hub',
    label: 'Hub',
    description: 'Return to the center of the OtakuCube',
    color: 'from-pink-400 via-fuchsia-500 to-purple-600',
  },
  {
    id: 'tradeCraft',
    label: 'Trade & Craft',
    description: 'Exchange petals and craft unique items',
    color: 'from-pink-300 via-rose-400 to-pink-500',
  },
  {
    id: 'miniGames',
    label: 'Mini-Games',
    description: 'Play exclusive Otaku-mori games',
    color: 'from-pink-200 via-fuchsia-400 to-pink-600',
  },
  {
    id: 'achievements',
    label: 'Achievements',
    description: 'Track your progress and collect rewards',
    color: 'from-pink-100 via-pink-300 to-pink-500',
  },
  {
    id: 'saveDecrypt',
    label: 'Decrypt Saves',
    description: 'Unlock hidden content and secrets',
    color: 'from-pink-50 via-pink-200 to-pink-400',
  },
];

export default function MiniGamesPage() {
  const [bootDone, setBootDone] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [activeFace, setActiveFace] = useState('hub');
  const [isRotating, setIsRotating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; rotation: number }>
  >([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize sounds
    audioRef.current = new window.Audio('/assets/gamecube-startup.mp3');
    hoverSoundRef.current = new window.Audio('/assets/hover.mp3');
    clickSoundRef.current = new window.Audio('/assets/click.mp3');

    // Set volume for UI sounds
    if (hoverSoundRef.current) hoverSoundRef.current.volume = 0.2;
    if (clickSoundRef.current) clickSoundRef.current.volume = 0.3;

    // Play boot sound immediately
    audioRef.current.play();

    // Boot sequence
    setTimeout(() => setShowFlash(true), 3000);
    setTimeout(() => {
      setBootDone(true);
      setShowFlash(false);
      setShowParticles(true);
      // Initialize particles
      setParticles(
        Array.from({ length: 30 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          rotation: Math.random() * 360,
        }))
      );
    }, 3400);

    return () => {
      audioRef.current?.pause();
      hoverSoundRef.current?.pause();
      clickSoundRef.current?.pause();
      audioRef.current = null;
      hoverSoundRef.current = null;
      clickSoundRef.current = null;
    };
  }, []);

  const handleFaceChange = (faceId: string) => {
    if (faceId === activeFace || isRotating) return;
    setIsRotating(true);
    setActiveFace(faceId);
    clickSoundRef.current?.play();
    setTimeout(() => setIsRotating(false), 1000);
  };

  const handleMenuHover = () => {
    hoverSoundRef.current?.play();
  };

  return (
    <main className="min-h-screen bg-black">
      <Header />
      {/* GameCube Boot Overlay */}
      {!bootDone && (
        <div
          id="gc-boot"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          <div
            className="gc-logo"
            style={{
              width: 240,
              height: 240,
              background: "url('/assets/gamecubelogo.png') no-repeat center",
              backgroundSize: 'contain',
              opacity: 1,
              animation: 'logo-fade-in 3s forwards',
            }}
          />
          <div
            className="gc-scanlines pointer-events-none absolute inset-0"
            style={{
              background:
                'repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(0,0,0,0.05) 2px)',
              animation: 'scanline-flicker 0.06s infinite',
              opacity: 0.08,
              animationDelay: '0.5s',
            }}
          />
          <style>{`
            @keyframes logo-fade-in {
              0%   { opacity: 0; transform: scale(0.8); }
              20%  { opacity: 1; transform: scale(1); }
              80%  { opacity: 1; transform: scale(1); }
              100% { opacity: 0; transform: scale(1.2); }
            }
            @keyframes scanline-flicker {
              0%,100% { opacity: 0.08; }
              50%     { opacity: 0.12; }
            }
          `}</style>
        </div>
      )}
      {/* Pink Flash Transition */}
      {showFlash && (
        <div
          id="transition-flash"
          className="animate-flash-pink pointer-events-none fixed inset-0 z-[9998] bg-[#FF2AB8]"
        />
      )}
      <style>{`
        @keyframes flash-pink {
          0%   { opacity: 0; }
          50%  { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flash-pink { animation: flash-pink 0.4s forwards; }
      `}</style>
      {/* OtakuCube Hub */}
      {bootDone && (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black">
          {/* Cherry Blossom Particles */}
          {showParticles && (
            <div className="particles pointer-events-none absolute inset-0">
              {particles.map(particle => (
                <div
                  key={particle.id}
                  className="particle absolute h-2 w-2 rounded-full bg-pink-300"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    transform: `rotate(${particle.rotation}deg)`,
                    animation: `float ${5 + Math.random() * 5}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                />
              ))}
            </div>
          )}
          <div className="cube-scene perspective-1000 relative flex flex-col items-center">
            <div
              className={`cube-container transition-all duration-1000 ${isRotating ? 'rotate-y-180' : ''}`}
            >
              <Image
                src="/assets/otakucube.png"
                alt="OtakuCube"
                width={340}
                height={340}
                className="transform-gpu rounded-2xl border-4 border-pink-400 shadow-2xl transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="face-menu absolute left-1/2 top-1/2 z-10 grid -translate-x-1/2 -translate-y-1/2 grid-cols-2 gap-6">
              {MENU_ITEMS.map(f => (
                <button
                  key={f.id}
                  className={`menu-btn bg-gradient-to-br ${f.color} flex flex-col items-center rounded-xl border-2 border-white/20 px-8 py-6 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-pink-400 ${
                    activeFace === f.id ? 'scale-110 ring-4 ring-pink-400' : ''
                  }`}
                  onClick={() => handleFaceChange(f.id)}
                  onMouseEnter={handleMenuHover}
                >
                  <span className="label text-lg font-bold text-white">{f.label}</span>
                  <span className="mt-2 text-sm text-white/80">{f.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Game Content */}
          {activeFace === 'miniGames' && (
            <div className="absolute left-1/2 top-1/2 z-20 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2">
              <PetalCollector />
            </div>
          )}

          {/* Achievements Content */}
          {activeFace === 'achievements' && (
            <div className="absolute left-1/2 top-1/2 z-20 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2">
              <Achievements />
            </div>
          )}

          {/* Trade & Craft Content */}
          {activeFace === 'tradeCraft' && (
            <div className="absolute left-1/2 top-1/2 z-20 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2">
              <TradeCraft />
            </div>
          )}

          <style jsx>{`
            @keyframes float {
              0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
              100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
              }
            }
            .particles {
              z-index: 1;
            }
            .particle {
              filter: blur(1px);
            }
          `}</style>
        </section>
      )}
    </main>
  );
}
