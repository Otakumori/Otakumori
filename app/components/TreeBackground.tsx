'use client';

import { useEffect, useState } from 'react';

/**
 * Cherry Blossom Tree Background Component
 *
 * CRITICAL SPECIFICATIONS:
 * - Absolute position (spans full page height)
 * - Scroll-reveal effect (tree moves UP as user scrolls DOWN)
 * - Initially shows top of tree (canopy) at page top
 * - As user scrolls, tree moves up to reveal trunk/roots at page bottom
 * - Tree ends at footer (bottom of tree aligned with bottom of page)
 * - Extends edge-to-edge, behind ALL content
 * - Proper z-index layering (z-index: -10)
 * - Smooth gradient fades at top/bottom
 * - 60fps performance optimized
 */
export default function TreeBackground() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);

  useEffect(() => {
    // Throttled scroll handler for 60fps performance
    let ticking = false;

    const updateDimensions = () => {
      setPageHeight(document.documentElement.scrollHeight);
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const progress = maxScroll > 0 ? scrolled / maxScroll : 0;
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initialize dimensions
    updateDimensions();

    // Use passive listeners for better scroll performance
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Calculate tree reveal position based on scroll progress
  // Tree is 200% height - start at 0% (showing top half), move UP to -100% (showing bottom half at footer)
  const treeRevealY = 0 - scrollProgress * 100;

  return (
    <>
      {/* Absolute tree background - spans full page height */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: 0,
          height: pageHeight || '100vh',
          zIndex: -10,
        }}
        aria-hidden="true"
      >
        {/* Tree with scroll-reveal effect */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `translate3d(0, ${treeRevealY}%, 0)`,
            backgroundImage: 'url(/assets/images/cherry-tree.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            height: '200%',
          }}
        />

        {/* Top fade gradient - subtle blend into dark header */}
        <div
          className="absolute inset-x-0 top-0 h-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, #080611 0%, #080611ee 30%, transparent 100%)',
            zIndex: 1,
          }}
        />

        {/* Bottom fade gradient - blends tree into dark footer */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #080611 0%, transparent 100%)',
            zIndex: 1,
          }}
        />
      </div>
    </>
  );
}
