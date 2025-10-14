'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface TreeBackgroundProps {
  className?: string;
}

export default function TreeBackground({ className = '' }: TreeBackgroundProps) {
  const [scrollY, setScrollY] = useState(0);

  // Scroll-reveal effect: Tree stays fixed, but reveals more as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      // Capture scroll position for parallax reveal
      // Tree moves up (negative) as we scroll down to reveal more of the image
      setScrollY(window.scrollY);
    };

    // Throttle for 60fps performance
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

  // Calculate tree reveal transform
  // At scrollY=0: see top of tree (blossoms)
  // At scrollY=200vh: see bottom of tree (roots)
  // Tree container is 300vh tall, we reveal it by moving it up
  const treeTransform = `translateY(${Math.max(-200, -scrollY * 0.5)}vh)`;

  return (
    <>
      {/* Fixed tree background container - never scrolls WITH page */}
      <div
        className={`fixed inset-0 overflow-hidden ${className}`}
        style={{ zIndex: -10 }}
        aria-hidden="true"
      >
        {/* Tree image container - 300vh tall for scroll reveal */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: treeTransform,
            height: '300vh',
            width: '100%',
            pointerEvents: 'none',
          }}
        >
          {/* Cherry tree image */}
          <div className="relative w-full h-full">
            <Image
              src="/assets/images/cherry-tree.png"
              alt="Cherry blossom tree"
              fill
              priority
              quality={90}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        </div>

        {/* Top gradient fade - blends tree into dark header */}
        <div
          className="absolute inset-x-0 top-0 h-40 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(8, 6, 17, 0.9) 0%, transparent 100%)',
            zIndex: 2,
          }}
        />

        {/* Bottom gradient fade - blends tree into dark footer */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(8, 6, 17, 0.9) 0%, transparent 100%)',
            zIndex: 2,
          }}
        />
      </div>
    </>
  );
}
