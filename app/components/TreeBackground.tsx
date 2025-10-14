'use client';

import { useEffect, useState } from 'react';

/**
 * Cherry Blossom Tree Background Component
 *
 * CRITICAL SPECIFICATIONS:
 * - Fixed position (does NOT scroll with page content)
 * - Parallax effect (tree moves at 50% scroll speed for depth)
 * - Extends edge-to-edge, behind ALL content
 * - Proper z-index layering (z-index: -10)
 * - Smooth gradient fades at top/bottom
 * - 60fps performance optimized
 */
export default function TreeBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Throttled scroll handler for 60fps performance
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Parallax: Tree moves at 50% of scroll speed for depth effect
          setScrollY(window.scrollY * 0.5);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Fixed tree background - never scrolls with page content */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -10 }} aria-hidden="true">
        {/* Tree with parallax effect */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `translate3d(0, ${-scrollY}px, 0)`,
            backgroundImage: 'url(/assets/images/tree-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            backgroundRepeat: 'no-repeat',
            // Ensure tree extends beyond viewport for parallax scrolling
            height: '120vh',
            minHeight: '1200px',
          }}
        />

        {/* Top fade gradient - blends tree into dark header */}
        <div
          className="absolute inset-x-0 top-0 h-40 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, #080611 0%, transparent 100%)',
            zIndex: -5,
          }}
        />

        {/* Bottom fade gradient - blends tree into dark footer */}
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
