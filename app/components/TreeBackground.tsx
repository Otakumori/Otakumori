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
      // Find footer to determine where tree should end
      const footer = document.querySelector('footer');
      
      // Calculate full page height (from top to footer or document end)
      let fullHeight = window.innerHeight; // Default to viewport
      
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        fullHeight = footerRect.top + window.scrollY;
      } else {
        // Fallback: use document scroll height or main-content end
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          const mainRect = mainContent.getBoundingClientRect();
          fullHeight = mainRect.bottom + window.scrollY;
        } else {
          fullHeight = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight,
            window.innerHeight
          );
        }
      }
      
      // Tree starts at top (behind navbar) and extends to footer
      // Use full document height to ensure it reaches the bottom
      const height = Math.max(fullHeight, window.innerHeight);
      
      setDimensions({ top: 0, height });
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
      {/* Absolute tree background - starts at top (behind navbar), extends to footer */}
      <div
        className="fixed inset-x-0 pointer-events-none"
        style={{
          top: 0,
          height: dimensions.height > 0 ? `${dimensions.height}px` : '100vh',
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

        {/* Top fade gradient - subtle fade behind navbar (tree visible but subtle) */}
        <div
          className="absolute inset-x-0 top-0 h-24 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(8, 6, 17, 0.4) 0%, rgba(8, 6, 17, 0.2) 50%, transparent 100%)',
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
