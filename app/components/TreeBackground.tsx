'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface TreeBackgroundProps {
  className?: string;
}

interface BurstPetal {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  size: number;
}

// Function to determine current season based on date
const getCurrentSeason = (): 'spring' | 'summer' | 'fall' | 'winter' => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11, we want 1-12

  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter'; // December, January, February
};

// Function to get seasonal tree image path
const getSeasonalTreePath = (season: string): string => {
  const treeMap: Record<string, string> = {
    spring: '/season/tree-spring.svg',
    summer: '/season/tree-summer.svg',
    fall: '/season/tree-fall.svg',
    winter: '/season/tree-winter.svg',
  };

  return treeMap[season] || '/season/tree-spring.svg'; // Fallback to spring
};

export default function TreeBackground({ className = '' }: TreeBackgroundProps) {
  const [scrollY, setScrollY] = useState(0);
  const [currentSeason, setCurrentSeason] = useState<string>('spring');
  const [treeImagePath, setTreeImagePath] = useState<string>('');
  const [burstPetals, setBurstPetals] = useState<BurstPetal[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const petalIdCounter = useRef(0);

  // Initialize season and tree path
  useEffect(() => {
    const season = getCurrentSeason();
    setCurrentSeason(season);
    setTreeImagePath(getSeasonalTreePath(season));
  }, []);

  // Handle tree click - spawn petal burst
  const handleTreeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Spawn 12-18 petals in a burst
    const petalCount = 12 + Math.floor(Math.random() * 7);
    const newPetals: BurstPetal[] = [];

    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 3 + Math.random() * 4;
      
      newPetals.push({
        id: petalIdCounter.current++,
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Slight upward bias
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: 1.0,
        size: 12 + Math.random() * 8,
      });
    }

    setBurstPetals((prev) => [...prev, ...newPetals]);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Parallax: Tree moves at 50% of scroll speed for depth effect
      setScrollY(window.scrollY * 0.5);
    };

    // Throttle for 60fps performance (16ms per frame)
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    return () => window.removeEventListener('scroll', scrollListener);
  }, []);

  // Update season daily (check every hour)
  useEffect(() => {
    const checkSeason = () => {
      const newSeason = getCurrentSeason();
      if (newSeason !== currentSeason) {
        setCurrentSeason(newSeason);
        setTreeImagePath(getSeasonalTreePath(newSeason));
      }
    };

    // Check season every hour
    const seasonInterval = setInterval(checkSeason, 60 * 60 * 1000);

    return () => clearInterval(seasonInterval);
  }, [currentSeason]);

  // Animate burst petals
  useEffect(() => {
    if (!canvasRef.current || burstPetals.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Match canvas size to viewport
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw petals
      setBurstPetals((prevPetals) => {
        const updatedPetals = prevPetals.map((petal) => {
          // Apply gravity and friction
          const newPetal = {
            ...petal,
            x: petal.x + petal.vx,
            y: petal.y + petal.vy,
            vx: petal.vx * 0.99, // Air resistance
            vy: petal.vy + 0.2, // Gravity
            rotation: petal.rotation + petal.rotationSpeed,
            life: petal.life - 0.008, // Fade out over time
          };

          // Draw petal if still alive
          if (newPetal.life > 0) {
            ctx.save();
            ctx.translate(newPetal.x, newPetal.y);
            ctx.rotate((newPetal.rotation * Math.PI) / 180);
            ctx.globalAlpha = newPetal.life * 0.9;

            // Petal shape (simple ellipse)
            ctx.fillStyle = currentSeason === 'spring' ? '#FFC0CB' : 
                            currentSeason === 'summer' ? '#90EE90' :
                            currentSeason === 'fall' ? '#FFA500' : '#E0E0E0';
            
            ctx.beginPath();
            ctx.ellipse(0, 0, newPetal.size, newPetal.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Subtle glow
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
          }

          return newPetal;
        });

        // Remove dead petals
        return updatedPetals.filter((petal) => petal.life > 0);
      });

      if (burstPetals.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [burstPetals.length, currentSeason]);

  if (!treeImagePath) {
    return null;
  }

  return (
    <>
      {/* Fixed tree background - extends full viewport, never scrolls WITH page */}
      <div
        className={`fixed inset-0 ${className}`}
        style={{ zIndex: -10 }}
        aria-hidden="true"
      >
        {/* Tree with parallax effect - clickable for petal burst */}
        <div
          className="absolute inset-0 will-change-transform transition-transform cursor-pointer"
          style={{
            transform: `translate3d(0, ${-scrollY}px, 0)`,
            backgroundImage: `url(${treeImagePath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'auto',
          }}
          onClick={handleTreeClick}
          role="button"
          tabIndex={0}
          aria-label="Click to create petal burst"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTreeClick(e as unknown as React.MouseEvent<HTMLDivElement>);
            }
          }}
        />

        {/* Petal burst canvas overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
        />

        {/* Top gradient fade - blends tree into dark header */}
        <div
          className="absolute inset-x-0 top-0 h-40 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, #080611 0%, transparent 100%)',
            zIndex: -5,
          }}
        />

        {/* Bottom gradient fade - blends tree into dark footer */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #080611 0%, transparent 100%)',
            zIndex: -5,
          }}
        />
      </div>
    </>
  );
}
