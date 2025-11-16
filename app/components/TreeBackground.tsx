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
      // Background should stop before footer starts (where it ended before)
      // Use viewport height as base, or stop at footer if visible
      const footer = document.querySelector('footer');
      
      let height = window.innerHeight; // Default: viewport height
      
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const footerTop = footerRect.top + window.scrollY;
        // Stop background just before footer starts
        height = Math.min(footerTop, window.innerHeight * 1.2); // Cap at 120% viewport
      }
      
      setPageHeight(height);
    };

    // Initialize dimensions after a short delay to ensure footer is rendered
    const initTimeout = setTimeout(updateDimensions, 100);
    updateDimensions();

    // Update on resize
    window.addEventListener('resize', updateDimensions);
    
    // Update on scroll (throttled)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateDimensions, 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(scrollTimeout);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', handleScroll);
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
