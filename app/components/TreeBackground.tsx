'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

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

  return treeMap[season] || '/assets/images/cherry-tree.png'; // Fallback to original
};

export default function TreeBackground({ className = '' }: TreeBackgroundProps) {
  const [documentHeight, setDocumentHeight] = useState<number>(0);
  const [currentSeason, setCurrentSeason] = useState<string>('spring');
  const [treeImagePath, setTreeImagePath] = useState<string>('');

  // Initialize season and tree path
  useEffect(() => {
    const season = getCurrentSeason();
    setCurrentSeason(season);
    setTreeImagePath(getSeasonalTreePath(season));
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      const body = document.body;
      const html = document.documentElement;
      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight,
      );
      setDocumentHeight(height);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(document.body);

    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
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

  if (documentHeight === 0 || !treeImagePath) {
    return null;
  }

  return (
    <>
      <div
        className={`fixed left-0 top-0 pointer-events-none ${className}`}
        style={{
          width: '55%',
          height: `${documentHeight}px`,
          zIndex: 1,
        }}
      >
        <Image
          src={treeImagePath}
          alt={`${currentSeason} cherry blossom tree`}
          fill
          className="object-cover object-left-top"
          priority
          sizes="55vw"
          onError={() => {
            // Fallback to original tree image if seasonal tree fails to load
            setTreeImagePath('/assets/images/cherry-tree.png');
          }}
        />
      </div>

      {/* Gradient overlay for navbar blending */}
      <div
        className="fixed left-0 top-0 pointer-events-none"
        style={{
          width: '55%',
          height: '80px', // Height of navbar
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)',
          zIndex: 2,
        }}
      />
    </>
  );
}
