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
      const N = 96; // More petals for better effect

      // Create multiple burst waves
      for (let wave = 0; wave < 3; wave++) {
        setTimeout(() => {
          for (let i = 0; i < N / 3; i++) {
            const p = document.createElement('div');
            p.className = 'petal';

            // Enhanced petal variety
            const size = Math.random() * 8 + 4;
            p.style.width = size + 'px';
            p.style.height = size * 0.7 + 'px';

            // Color variation
            const colors = ['#ec4899', '#8b5cf6', '#f59e0b', '#10b981'];
            p.style.background = colors[Math.floor(Math.random() * colors.length)];

            const ang = Math.PI * 2 * (i / (N / 3)) + Math.random() * 0.8;
            const dist = 80 + Math.random() * 160 + wave * 40;
            const speed = 0.8 + Math.random() * 0.4;

            p.style.left = cx + 'px';
            p.style.top = cy + 'px';
            p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
            p.style.setProperty('--dy', Math.sin(ang) * dist + (30 + Math.random() * 60) + 'px');
            p.style.setProperty('--speed', speed.toString());

            root.appendChild(p);
            setTimeout(() => p.remove(), 1800);
          }
        }, wave * 150);
      }

      // Add hollow center glow effect
      const hollowCenter = root.querySelector('.hollow-center');
      if (hollowCenter) {
        (hollowCenter as HTMLElement).style.opacity = '1';
        (hollowCenter as HTMLElement).style.animation = 'hollowGlow 2s ease-out forwards';
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
          '--cubesize': '180px',
          '--c': 'calc(var(--cubesize) / 3)',
          '--step-ms': '75ms',
          '--start-wait-ms': '300ms',
          '--easing': 'cubic-bezier(.22,.85,.25,1)',
          '--pink': '#ec4899',
          '--pink-deep': '#be185d',
          '--purple': '#8b5cf6',
          '--purple-deep': '#6d28d9',
          '--glassA': 'rgba(236,72,153,.25)',
          '--glassB': 'rgba(139,92,246,.35)',
          '--glassStroke': 'rgba(236,72,153,.85)',
          '--glow-color': 'rgba(236,72,153,.4)',
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
            {/* O-shape formation - 8 squares arranged in a circle */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const radius = 1.2; // Distance from center
              const centerX = 1.5; // Center of O-shape
              const centerY = 1.5;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;

              return (
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
                    top: `calc(var(--c) * ${y})`,
                    left: `calc(var(--c) * ${x})`,
                  }}
                />
              );
            })}

            {/* Hollow center */}
            <div
              className="hollow-center"
              style={{
                position: 'absolute',
                width: 'calc(var(--c) * 1.5)',
                height: 'calc(var(--c) * 1.5)',
                background: 'transparent',
                border: '2px solid rgba(236,72,153,.3)',
                borderRadius: '50%',
                top: 'calc(var(--c) * 0.75)',
                left: 'calc(var(--c) * 0.75)',
                opacity: 0,
                transition: 'opacity 300ms var(--easing)',
              }}
            />
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
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.8));
          pointer-events: none;
          opacity: 0.98;
          animation: petalFall var(--speed, 1) 1800ms ease-out forwards;
          transform-origin: center;
        }

        @keyframes petalFall {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          20% {
            transform: translate(calc(var(--dx) * 0.3), calc(var(--dy) * 0.3)) rotate(90deg) scale(1.1);
            opacity: 0.9;
          }
          60% {
            transform: translate(calc(var(--dx) * 0.8), calc(var(--dy) * 0.8)) rotate(240deg) scale(0.9);
            opacity: 0.7;
          }
          100% {
            transform: translate(var(--dx), var(--dy)) rotate(420deg) scale(0.6);
            opacity: 0;
          }
        }

        @keyframes hollowGlow {
          0% {
            box-shadow: 0 0 0 rgba(236, 72, 153, 0);
            border-color: rgba(236,72,153,.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(236, 72, 153, 0.6), 0 0 80px rgba(139, 92, 246, 0.4);
            border-color: rgba(236,72,153,.8);
          }
          100% {
            box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
            border-color: rgba(236,72,153,.5);
          }
        }
      `}</style>
    </div>
  );
}
