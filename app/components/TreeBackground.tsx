'use client';

import { useEffect, useState } from 'react';

/**
 * Cherry Blossom Tree Background Component
 *
 * CRITICAL SPECIFICATIONS:
 * - Absolute position (spans full page height exactly)
 * - Tree flows naturally with page scroll (no aggressive movement)
 * - Top of tree aligns with top of page
 * - Bottom of tree aligns with footer
 * - Extends edge-to-edge, behind ALL content
 * - Proper z-index layering (z-index: -10)
 * - Smooth gradient fades at top/bottom
 * - 60fps performance optimized
 */
export default function TreeBackground() {
  const [pageHeight, setPageHeight] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      // Use the maximum of scrollHeight and clientHeight to ensure full coverage
      const height = Math.max(
        document.documentElement.scrollHeight,
        document.documentElement.clientHeight,
        document.body.scrollHeight,
        document.body.clientHeight,
      );
      setPageHeight(height);
    };

    // Initialize dimensions
    updateDimensions();

    // Update on resize and scroll (content may change)
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('scroll', updateDimensions, { passive: true });
    
    // Also update when DOM changes (content loaded)
    const observer = new MutationObserver(updateDimensions);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', updateDimensions);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Absolute tree background - spans exactly full page height */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: 0,
          height: pageHeight || '100vh',
          zIndex: -10,
        }}
        aria-hidden="true"
      >
        {/* Tree image - natural flow with page */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/assets/images/cherry-tree.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
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
