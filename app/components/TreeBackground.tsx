'use client';

import { useEffect, useState } from 'react';

/**
 * Cherry Blossom Tree Background Component
 *
 * CRITICAL SPECIFICATIONS:
 * - Starts behind header (header is sticky, ~80px height)
 * - Ends at footer begin (footer starts where content ends)
 * - Visual boundaries: clear fade gradients at top/bottom
 * - Works same on mobile and desktop
 * - Proper z-index layering (z-index: -10, behind header z-20, footer z-50)
 * - 60fps performance optimized
 */
export default function TreeBackground() {
  const [dimensions, setDimensions] = useState({ top: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      // Find header (sticky navbar)
      const header = document.querySelector('header, nav[class*="sticky"], nav[class*="fixed"]');
      const footer = document.querySelector('footer');
      
      // Header height (default ~80px if not found)
      const headerHeight = header ? header.getBoundingClientRect().height : 80;
      
      // Footer position
      let footerTop = window.innerHeight; // Default to viewport height
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        footerTop = footerRect.top + window.scrollY;
      } else {
        // Fallback: use main-content end or viewport
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          const mainRect = mainContent.getBoundingClientRect();
          footerTop = mainRect.bottom + window.scrollY;
        }
      }
      
      // Tree starts after header, ends at footer
      const top = headerHeight;
      const height = Math.max(footerTop - headerHeight, window.innerHeight - headerHeight);
      
      setDimensions({ top, height });
    };

    // Initial calculation
    updateDimensions();

    // Update on resize and scroll
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('scroll', updateDimensions, { passive: true });
    
    // Also update when DOM changes (footer/header might load later)
    const observer = new MutationObserver(() => {
      updateDimensions();
    });
    
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', updateDimensions);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Absolute tree background - starts behind header, ends at footer */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: `${dimensions.top}px`,
          height: dimensions.height > 0 ? `${dimensions.height}px` : 'calc(100vh - 80px)',
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

        {/* Top fade gradient - clear boundary where tree starts (behind header) */}
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, #080611 0%, #080611 40%, rgba(8, 6, 17, 0.8) 70%, transparent 100%)',
            zIndex: 1,
          }}
        />

        {/* Bottom fade gradient - clear boundary where tree ends (before footer) */}
        <div
          className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #080611 0%, #080611 30%, rgba(8, 6, 17, 0.8) 60%, transparent 100%)',
            zIndex: 1,
          }}
        />
      </div>
    </>
  );
}
