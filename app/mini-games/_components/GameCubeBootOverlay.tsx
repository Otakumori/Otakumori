'use client';

import { useEffect, useRef, useState } from 'react';

interface GameCubeBootOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function GameCubeBootOverlay({ onComplete, onSkip }: GameCubeBootOverlayProps) {
  const [isSkippable, setIsSkippable] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    // Allow skipping after 1.2s
    const skipTimer = setTimeout(() => {
      setIsSkippable(true);
    }, 1200);

    // Start the animation sequence
    if (!prefersReducedMotion) {
      startAnimation();
    } else {
      // Show static frame for reduced motion
      showStaticFrame();
    }

    // Cleanup
    return () => {
      clearTimeout(skipTimer);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [prefersReducedMotion]);

  const showStaticFrame = () => {
    // Show final static state
    const cube = containerRef.current?.querySelector('#cube');
    const label = containerRef.current?.querySelector('#gcLabel');
    const sub = containerRef.current?.querySelector('#gcSub');

    if (cube) cube.classList.add('click', 'glow');
    if (label) (label as HTMLElement).style.opacity = '1';
    if (sub) (sub as HTMLElement).style.opacity = '1';

    // Auto-complete after showing static frame
    setTimeout(() => {
      setIsComplete(true);
      onComplete();
    }, 2000);
  };

  const startAnimation = () => {
    // Auto-tune total duration to ~5s
    const TARGET_MS = 5000;
    const BOOT_MS = 280;
    const startWait = 250;
    const TOTAL_STEPS = 31;
    const stepMs = Math.max(28, Math.round((TARGET_MS - startWait - BOOT_MS) / TOTAL_STEPS));

    // Update CSS variable
    document.documentElement.style.setProperty('--step-ms', `${stepMs}ms`);

    // Start the main animation sequence
    animationRef.current = setTimeout(() => {
      animate();
    }, startWait);
  };

  const animate = () => {
    const cubeElement = containerRef.current?.querySelector('#cube');
    const minicube = containerRef.current?.querySelector('#minicube') as HTMLElement;
    const label = containerRef.current?.querySelector('#gcLabel') as HTMLElement;
    const sub = containerRef.current?.querySelector('#gcSub') as HTMLElement;

    if (!minicube) return;

    const cubeSize = 150; // --cubesize
    const cSize = cubeSize / 3;
    let x = cSize * 2,
      y = 0,
      z = 0;
    const step =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue('--step-ms')) || 90;

    const ring = Array.from(containerRef.current?.querySelectorAll('.square') || []);

    function rX(d: number) {
      minicube.classList.toggle('transition');
      minicube.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateX(${d}deg)`;
    }
    function rY(d: number) {
      minicube.classList.toggle('transition');
      minicube.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateY(${d}deg)`;
    }
    function rZ(d: number) {
      minicube.classList.toggle('transition');
      minicube.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateZ(${d}deg)`;
    }

    function show(el: Element | null) {
      if (!el) return;
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'scale(1)';
    }

    function petals() {
      const root = containerRef.current?.querySelector('#cube');
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const cx = rect.width / 2,
        cy = rect.height / 2;
      const N = 64;

      for (let i = 0; i < N; i++) {
        const p = document.createElement('div');
        p.className = 'petal';
        const ang = Math.PI * 2 * (i / N) + Math.random() * 0.6;
        const dist = 60 + Math.random() * 140;
        p.style.left = cx + 'px';
        p.style.top = cy + 'px';
        p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
        p.style.setProperty('--dy', Math.sin(ang) * dist + (24 + Math.random() * 46) + 'px');
        root.appendChild(p);
        setTimeout(() => p.remove(), 1300);
      }
    }

    // Animation sequence (simplified version)
    let i = 0,
      rI = 0;

    const runStep = (delay: number, action: () => void) => {
      setTimeout(action, step * delay);
    };

    // Run the cube animation sequence
    runStep(i++, () => show(ring[rI++]));

    // Simplified animation steps (key movements)
    runStep(i++, () => {
      rY(-90);
    });
    runStep(i++, () => {
      x -= cSize;
      rY(0);
      show(ring[rI++]);
    });
    runStep(i++, () => {
      rX(-90);
    });
    runStep(i++, () => {
      y += cSize;
      rX(0);
      show(ring[rI++]);
    });

    // Continue with more steps...
    for (let step = 0; step < 25; step++) {
      runStep(i++, () => {
        if (rI < ring.length) {
          show(ring[rI++]);
        }
      });
    }

    // Final step - complete the animation
    runStep(i++, () => {
      minicube.style.opacity = '0';
      cubeElement?.classList.add('click', 'glow');
      if (label) label.style.opacity = '1';
      if (sub) sub.style.opacity = '1';

      setTimeout(() => {
        petals();
        setTimeout(() => {
          setIsComplete(true);
          onComplete();
        }, 1000);
      }, 100);
    });
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (isSkippable && (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape')) {
      e.preventDefault();
      onSkip();
    }
  };

  const handleClick = () => {
    if (isSkippable) {
      onSkip();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isSkippable]);

  if (isComplete) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
      onClick={handleClick}
      data-test="gc-boot-overlay"
      style={
        {
          '--cubesize': '150px',
          '--c': 'calc(var(--cubesize) / 3)',
          '--step-ms': '90ms',
          '--start-wait-ms': '250ms',
          '--easing': 'cubic-bezier(.22,.85,.25,1)',
          '--pink': '#FF7FA3',
          '--pink-deep': '#FF5F95',
          '--glassA': 'rgba(255,127,163,.28)',
          '--glassB': 'rgba(255,127,163,.44)',
          '--glassStroke': 'rgba(255,127,163,.75)',
        } as React.CSSProperties
      }
    >
      {/* Skip button */}
      {isSkippable && (
        <button
          className="absolute bottom-8 right-8 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 text-sm transition-colors"
          onClick={onSkip}
          aria-label="Skip boot animation"
        >
          Skip
        </button>
      )}

      <div id="cvs" className="h-full w-full relative" style={{ perspective: '2200px' }}>
        <div
          id="cube"
          className="absolute"
          style={{
            width: 'var(--cubesize)',
            height: 'var(--cubesize)',
            left: '50%',
            top: '50%',
            transformStyle: 'preserve-3d',
            transform:
              'translate3d(calc(var(--cubesize) * -0.5), calc(var(--cubesize) * -1.0), 0) rotateX(55deg) rotateZ(45deg)',
            animation: 'bootshake 280ms ease-out var(--start-wait-ms) both',
          }}
        >
          {/* Cube faces */}
          <div
            className="cubeface top"
            style={{
              position: 'absolute',
              width: 'var(--cubesize)',
              height: 'var(--cubesize)',
              transformStyle: 'preserve-3d',
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="square"
                style={{
                  position: 'absolute',
                  width: 'var(--c)',
                  height: 'var(--c)',
                  background: 'linear-gradient(160deg, var(--glassB), var(--glassA))',
                  border: '1.5px solid var(--glassStroke)',
                  boxSizing: 'border-box',
                  opacity: 0,
                  transform: 'scale(.94)',
                  transition:
                    'opacity 160ms var(--easing), transform 160ms var(--easing), box-shadow 300ms ease',
                  backdropFilter: 'blur(6px) saturate(160%)',
                  top: i === 0 ? '0' : i === 1 ? '0' : i === 2 ? 'var(--c)' : 'calc(var(--c) * 2)',
                  left: i === 0 ? 'var(--c)' : i === 1 ? '0' : i === 2 ? '0' : '0',
                }}
              />
            ))}
          </div>

          <div
            className="cubeface front"
            style={{
              position: 'absolute',
              width: 'var(--cubesize)',
              height: 'var(--cubesize)',
              transformStyle: 'preserve-3d',
              top: 'var(--cubesize)',
              transformOrigin: 'top',
              transform: 'rotateX(-90deg)',
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="square"
                style={{
                  position: 'absolute',
                  width: 'var(--c)',
                  height: 'var(--c)',
                  background: 'linear-gradient(160deg, var(--glassB), var(--glassA))',
                  border: '1.5px solid var(--glassStroke)',
                  boxSizing: 'border-box',
                  opacity: 0,
                  transform: 'scale(.94)',
                  transition:
                    'opacity 160ms var(--easing), transform 160ms var(--easing), box-shadow 300ms ease',
                  backdropFilter: 'blur(6px) saturate(160%)',
                  top: i < 3 ? `calc(var(--c) * ${i})` : 'calc(var(--c) * 2)',
                  left: i < 3 ? '0' : i === 3 ? 'var(--c)' : 'calc(var(--c) * 2)',
                }}
              />
            ))}
          </div>

          <div
            className="cubeface right"
            style={{
              position: 'absolute',
              width: 'var(--cubesize)',
              height: 'var(--cubesize)',
              transformStyle: 'preserve-3d',
              left: 'var(--cubesize)',
              transformOrigin: 'left',
              transform: 'rotateY(90deg)',
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="square"
                style={{
                  position: 'absolute',
                  width: 'var(--c)',
                  height: 'var(--c)',
                  background: 'linear-gradient(160deg, var(--glassB), var(--glassA))',
                  border: '1.5px solid var(--glassStroke)',
                  boxSizing: 'border-box',
                  opacity: 0,
                  transform: 'scale(.94)',
                  transition:
                    'opacity 160ms var(--easing), transform 160ms var(--easing), box-shadow 300ms ease',
                  backdropFilter: 'blur(6px) saturate(160%)',
                  top:
                    i === 0
                      ? 'calc(var(--c) * 2)'
                      : i === 1
                        ? 'var(--c)'
                        : i < 5
                          ? '0'
                          : 'var(--c)',
                  left:
                    i === 0
                      ? 'calc(var(--c) * 2)'
                      : i === 1
                        ? 'calc(var(--c) * 2)'
                        : i === 2
                          ? 'calc(var(--c) * 2)'
                          : i === 3
                            ? 'var(--c)'
                            : i === 4
                              ? '0'
                              : '0',
                }}
              />
            ))}
          </div>

          {/* Mini-cube */}
          <div
            id="minicube"
            style={{
              position: 'absolute',
              width: 'var(--c)',
              height: 'var(--c)',
              transform: 'translate3d(calc(var(--c) * 2), 0, 0)',
              transformStyle: 'preserve-3d',
              transformOrigin: '0 0 0',
            }}
            className="transition"
          >
            {['top', 'front', 'left', 'right', 'back', 'bottom'].map((face) => (
              <div
                key={face}
                className={`minicubeface ${face}`}
                style={{
                  position: 'absolute',
                  width: 'var(--c)',
                  height: 'var(--c)',
                  background: 'linear-gradient(160deg, var(--glassB), var(--glassA))',
                  border: '1px solid var(--glassStroke)',
                  boxSizing: 'border-box',
                  backdropFilter: 'blur(6px) saturate(160%)',
                  transform:
                    face === 'top'
                      ? 'translate3d(0,0,var(--c))'
                      : face === 'front'
                        ? 'rotateX(-90deg)'
                        : face === 'left'
                          ? 'rotateY(-90deg)'
                          : face === 'right'
                            ? 'rotateY(90deg)'
                            : face === 'back'
                              ? 'rotateX(90deg)'
                              : 'translate3d(0,0,calc(var(--c) * -1))',
                  transformOrigin:
                    face === 'front'
                      ? 'bottom'
                      : face === 'left'
                        ? 'left'
                        : face === 'right'
                          ? 'right'
                          : face === 'back'
                            ? 'top'
                            : undefined,
                }}
              />
            ))}
          </div>
        </div>

        <div
          id="gcLabel"
          className="absolute"
          style={{
            left: '50%',
            top: 'calc(50% + var(--cubesize) * 0.90)',
            transform: 'translateX(-50%)',
            color: 'var(--pink)',
            fontWeight: 800,
            fontSize: '18px',
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            textShadow: '0 0 10px rgba(255,157,179,.25), 0 2px 0 #111',
            opacity: 0,
            transition: 'opacity 220ms ease',
          }}
        >
          OTAKU-MORI
        </div>

        <div
          id="gcSub"
          className="absolute"
          style={{
            left: '50%',
            top: 'calc(50% + var(--cubesize) * 1.06)',
            transform: 'translateX(-50%)',
            color: 'rgba(255,157,179,.85)',
            fontWeight: 500,
            fontSize: '12px',
            letterSpacing: '0.08em',
            fontStyle: 'italic',
            opacity: 0,
            transition: 'opacity 220ms ease',
          }}
        >
          <em>made with ♡</em>
        </div>
      </div>

      <style>{`
        .transition {
          transition: transform var(--step-ms) var(--easing);
        }

        #cube.click {
          animation: clickPop 220ms ease-out 1 forwards;
        }

        @keyframes clickPop {
          0% {
            transform: translate3d(calc(var(--cubesize) * -0.5), calc(var(--cubesize) * -1), 0)
              rotateX(55deg) rotateZ(45deg) scale(1);
          }
          70% {
            transform: translate3d(calc(var(--cubesize) * -0.5), calc(var(--cubesize) * -1), 0)
              rotateX(55deg) rotateZ(45deg) scale(1.12);
          }
          100% {
            transform: translate3d(calc(var(--cubesize) * -0.5), calc(var(--cubesize) * -1), 0)
              rotateX(55deg) rotateZ(45deg) scale(1.02);
          }
        }

        #cube.glow .square {
          animation: glow 420ms ease-out 1;
        }

        @keyframes glow {
          0% {
            box-shadow: 0 0 0 rgba(255, 127, 163, 0);
          }
          60% {
            box-shadow:
              0 0 28px rgba(255, 127, 163, 0.85),
              0 0 64px rgba(255, 157, 179, 0.35);
          }
          100% {
            box-shadow: 0 0 12px rgba(255, 157, 179, 0.25);
          }
        }

        @keyframes bootshake {
          0% {
            transform: translate3d(calc(var(--cubesize) * -0.5), calc(var(--cubesize) * -1), 0)
              rotateX(55deg) rotateZ(45deg);
          }
          50% {
            transform: translate3d(calc(var(--cubesize) * -0.5), calc(var(--cubesize) * -1), 0)
              rotateX(47deg) rotateZ(45deg);
          }
          100% {
            transform: translate3d(calc(var(--cubesize) * -0.5), calc(var(--cubesize) * -1), 0)
              rotateX(55deg) rotateZ(45deg);
          }
        }

        .petal {
          position: absolute;
          width: 12px;
          height: 8px;
          border-radius: 12px/8px;
          background: var(--pink);
          filter: drop-shadow(0 0 6px rgba(255, 157, 179, 0.65));
          pointer-events: none;
          opacity: 0.98;
          animation: petalFall 1200ms ease-out forwards;
        }

        @keyframes petalFall {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          60% {
            transform: translate(var(--dx), var(--dy)) rotate(240deg);
          }
          100% {
            transform: translate(calc(var(--dx) * 1.2), calc(var(--dy) * 1.25)) rotate(420deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
