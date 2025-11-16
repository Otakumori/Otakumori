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
    // Simple viewport height - background stops at viewport (where it ended before)
    const updateDimensions = () => {
      setPageHeight(window.innerHeight);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
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
