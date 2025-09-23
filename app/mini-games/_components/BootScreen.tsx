'use client';
import { useEffect, useState } from 'react';

interface BootScreenProps {
  onDone: () => void;
}

export default function BootScreen({ onDone }: BootScreenProps) {
  const [phase, setPhase] = useState<
    'initial' | 'cubes-rolling' | 'assembly' | 'logo-reveal' | 'complete'
  >('initial');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      // Skip animation for accessibility
      setTimeout(() => {
        setPhase('complete');
        onDone();
      }, 800);
      return;
    }

    // Authentic GameCube boot sequence timing
    const timeouts = [
      setTimeout(() => setPhase('cubes-rolling'), 300),
      setTimeout(() => setPhase('assembly'), 1200),
      setTimeout(() => setPhase('logo-reveal'), 2000),
      setTimeout(() => setPhase('complete'), 2800),
      setTimeout(() => onDone(), 3200),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [onDone]);

  if (!mounted) return null;

  return (
    <div
      className="relative isolate z-0 h-screen w-full overflow-hidden bg-gradient-to-b from-purple-900 via-purple-800 to-black grid place-items-center"
      data-gamecube-boot="true"
      style={{
        willChange: 'opacity, transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Authentic GameCube startup styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes gamecube-roll {
              0% {
                transform: translateX(-200px) rotateX(0deg) rotateY(0deg);
                opacity: 0;
              }
              30% {
                opacity: 1;
              }
              100% {
                transform: translateX(0) rotateX(360deg) rotateY(180deg);
                opacity: 1;
              }
            }
            @keyframes gamecube-assemble {
              0% {
                transform: scale(0.8) rotateX(360deg) rotateY(180deg);
              }
              60% {
                transform: scale(1.1) rotateX(10deg) rotateY(5deg);
              }
              80% {
                transform: scale(1.05) rotateX(0deg) rotateY(0deg);
              }
              100% {
                transform: scale(1) rotateX(0deg) rotateY(0deg);
              }
            }
            @keyframes o-formation {
              0% {
                clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
              }
              100% {
                clip-path: polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%);
              }
            }
            @keyframes petal-burst {
              0% {
                transform: scale(0) rotate(0deg);
                opacity: 1;
              }
              50% {
                transform: scale(1.5) rotate(180deg);
                opacity: 0.8;
              }
              100% {
                transform: scale(3) rotate(360deg);
                opacity: 0;
              }
            }
            @keyframes logo-glow {
              0%, 100% {
                text-shadow: 0 0 10px rgba(255, 79, 163, 0.5);
              }
              50% {
                text-shadow: 0 0 20px rgba(255, 79, 163, 0.8), 0 0 30px rgba(255, 79, 163, 0.6);
              }
            }
            @keyframes sparkle {
              0%, 100% { opacity: 0; transform: scale(0.5); }
              50% { opacity: 1; transform: scale(1); }
            }
          `,
        }}
      />

      {/* GameCube Logo */}
      <div className="relative z-10">
        {/* Rolling cubes phase */}
        {phase === 'cubes-rolling' && (
          <div className="flex space-x-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg shadow-lg"
                style={{
                  animation: `gamecube-roll 900ms ease-out ${i * 100}ms forwards`,
                  transform: 'translateX(-200px)',
                  opacity: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Assembly phase */}
        {(phase === 'assembly' || phase === 'logo-reveal' || phase === 'complete') && (
          <div className="relative">
            {/* Main O-shaped GameCube */}
            <div
              className="w-24 h-24 bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 rounded-xl shadow-2xl border border-pink-300/30 relative"
              style={{
                animation:
                  phase === 'assembly' ? 'gamecube-assemble 800ms ease-out forwards' : 'none',
                transform:
                  phase === 'assembly' ? 'scale(0.8) rotateX(360deg) rotateY(180deg)' : 'scale(1)',
              }}
            >
              {/* O-shaped hollow center */}
              <div
                className="absolute inset-4 bg-black rounded-lg border border-pink-200/20"
                style={{
                  opacity:
                    phase === 'assembly' || phase === 'logo-reveal' || phase === 'complete' ? 1 : 0,
                  transition: 'opacity 400ms ease-out 600ms',
                }}
              />

              {/* GameCube face details - pink themed */}
              <div className="absolute inset-2 bg-gradient-to-br from-pink-300/20 to-transparent rounded-lg" />
              <div className="absolute top-2 left-2 w-4 h-4 bg-pink-200/30 rounded-full" />
              <div className="absolute bottom-2 right-2 w-6 h-1 bg-pink-200/40 rounded-full" />

              {/* Petal explosion */}
              {phase === 'logo-reveal' && (
                <>
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-2 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full opacity-90"
                      style={{
                        top: '50%',
                        left: '50%',
                        transformOrigin: 'center',
                        transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-20px)`,
                        animation: `petal-burst 1.5s ease-out ${i * 50}ms forwards`,
                      }}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Logo text */}
            {(phase === 'logo-reveal' || phase === 'complete') && (
              <div className="mt-8 text-center">
                <h1
                  className="text-4xl font-bold text-white tracking-wider"
                  style={{
                    fontFamily: 'Roboto Condensed, sans-serif',
                    animation:
                      phase === 'logo-reveal' ? 'logo-glow 2s ease-in-out infinite' : 'none',
                  }}
                >
                  OTAKU-MORI
                </h1>
                <p className="text-pink-200 text-sm mt-2 tracking-wide">GAME CONSOLE</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skip button */}
      <button
        onClick={() => {
          setPhase('complete');
          onDone();
        }}
        className="absolute bottom-8 right-8 text-purple-200 text-sm hover:text-white transition-colors z-20 px-3 py-1 rounded border border-purple-400/30 hover:border-purple-300"
      >
        Skip
      </button>

      {/* Authentic GameCube background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-purple-900/20" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
    </div>
  );
}
