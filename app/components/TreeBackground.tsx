'use client';

import { logger } from '@/app/lib/logger';
import { useEffect, useState } from 'react';

/**
 * Enhanced Cherry Blossom Tree Background Component
 *
 * CRITICAL: This component should ONLY be used via TreeBackgroundWrapper,
 * which ensures it only renders on the home page. Do not import directly
 * in other pages.
 *
 * ENHANCED SPECIFICATIONS:
 * - Spans header to footer (full page height)
 * - Fixed positioning - entire image always visible
 * - Right side positioning (100px offset)
 * - Smooth fade gradients at top/bottom
 * - Updates on resize
 * - Proper z-index layering (z-index: -10, behind header z-20, footer z-50)
 * - 60fps performance optimized
 */
export default function TreeBackground() {
  const [dimensions, setDimensions] = useState({ top: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted to prevent SSR issues
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isMounted || typeof window === 'undefined') return;

    const updateDimensions = () => {
      try {
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
              window.innerHeight,
            );
          }
        }

        // Tree starts at top (0) and ends exactly at footer
        // No extra height - tree should end where footer begins
        const height = fullHeight;

        setDimensions({ top: 0, height });
      } catch (error) {
        // Defensive: if DOM queries fail, use viewport height
        if (typeof console !== 'undefined' && typeof console.error === 'function') {
          logger.error('[TreeBackground] Error updating dimensions:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        }
        setDimensions({ top: 0, height: window.innerHeight });
      }
    };

    // Initial calculation with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateDimensions, 0);
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
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', updateDimensions);
      observer.disconnect();
    };
  }, [isMounted]);

  // Ensure we render even if dimensions aren't calculated yet
  const displayHeight = dimensions.height > 0 ? `${dimensions.height}px` : '100vh';

  // No parallax needed - tree stays fixed, entire image always visible
  // (removed parallaxOffset calculation)

  return (
    <>
      {/* Fixed tree background - entire image always visible across full page height */}
      <div
        className="fixed inset-x-0 pointer-events-none"
        style={{
          top: 0,
          height: displayHeight, // Full page height (top to footer)
          zIndex: -10, // Behind header (z-50) but above starfield (z-11)
        }}
        aria-hidden="true"
      >
        {/* Tree image - covers full height, no movement */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/assets/images/cherry-tree.png)',
            backgroundSize: 'cover', // Cover full height
            backgroundPosition: 'right center', // Centered vertically, positioned on right
            backgroundRepeat: 'no-repeat',
            opacity: isMounted ? 1 : 0,
            transition: 'opacity 0.3s ease-in',
            transform: 'translate3d(100px, 0, 0)', // Right offset, no parallax
            willChange: 'auto', // No transform animation needed
          }}
        />

        {/* Minimal top fade - tree should be visible under header */}
        <div
          className="absolute inset-x-0 top-0 h-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(8, 6, 17, 0.3) 0%, transparent 100%)',
            zIndex: 1,
          }}
        />

        {/* Bottom fade gradient - blends with footer */}
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
