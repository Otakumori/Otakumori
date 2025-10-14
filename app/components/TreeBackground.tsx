'use client';

import { useEffect, useState } from 'react';

interface TreeBackgroundProps {
  className?: string;
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

  // Initialize season and tree path
  useEffect(() => {
    const season = getCurrentSeason();
    setCurrentSeason(season);
    setTreeImagePath(getSeasonalTreePath(season));
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

  if (!treeImagePath) {
    return null;
  }

  return (
    <>
      {/* Fixed tree background - extends full viewport, never scrolls WITH page */}
      <div
        className={`fixed inset-0 pointer-events-none ${className}`}
        style={{ zIndex: -10 }}
        aria-hidden="true"
      >
        {/* Tree with parallax effect */}
        <div
          className="absolute inset-0 will-change-transform transition-transform"
          style={{
            transform: `translate3d(0, ${-scrollY}px, 0)`,
            backgroundImage: `url(${treeImagePath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
          }}
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
