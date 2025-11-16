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
    let timeoutId: NodeJS.Timeout;
    let rafId: number | null = null;
    
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

    // Throttled update using requestAnimationFrame for better performance
    const throttledUpdate = () => {
      clearTimeout(timeoutId);
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          updateDimensions();
        });
      }
      // Also set a timeout fallback for slower updates
      timeoutId = setTimeout(() => {
        if (rafId === null) {
          updateDimensions();
        }
      }, 200); // Less frequent updates
    };

    // Initialize dimensions
    updateDimensions();

    // Update on resize only (removed scroll listener - too frequent)
    window.addEventListener('resize', throttledUpdate);
    
    // Update when main content changes (limited scope, debounced)
    const observer = new MutationObserver(() => {
      throttledUpdate();
    });
    
    // Only observe main content area, not entire body (better performance)
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      observer.observe(mainContent, {
        childList: true,
        subtree: false, // Only direct children, not deep subtree
        attributes: false, // Don't watch attributes
      });
    }

    // Update on initial load completion
    if (document.readyState === 'complete') {
      updateDimensions();
    } else {
      window.addEventListener('load', updateDimensions, { once: true });
    }

    return () => {
      clearTimeout(timeoutId);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('resize', throttledUpdate);
      window.removeEventListener('load', updateDimensions);
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
