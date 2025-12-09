'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';

/**
 * ScrollableTree Background Component
 * 
 * Shows the ENTIRE tree image vertically (full height visible when scrolling top to bottom).
 * Shows the ENTIRE image horizontally (full width visible).
 * Synchronized scrolling with page content for smooth, natural movement.
 * Optimized for performance with memoization and efficient scroll handling.
 */
export default function ScrollableTree() {
  const [pageHeight, setPageHeight] = useState(2000);
  const [viewportHeight, setViewportHeight] = useState(1000);
  const [mounted, setMounted] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState(0.5); // Default 2:1 ratio
  const [scrollY, setScrollY] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(80); // Default header height
  const footerRef = useRef<HTMLElement | null>(null); // Cache footer element
  const rafIdRef = useRef<number | null>(null); // Track RAF ID for cleanup

  // Memoized height update function - defined at component level
  const updateHeight = useCallback(() => {
    // Use cached footer or query once
    if (!footerRef.current) {
      footerRef.current = document.querySelector('footer');
    }
    
    let height: number;
    
    if (footerRef.current) {
      // Tree ends at footer with some vertical stretch for better coverage
      const footerRect = footerRef.current.getBoundingClientRect();
      const footerTop = footerRect.top + window.scrollY;
      // Add vertical stretch - extends slightly past footer for better visual coverage
      height = footerTop + 200; // 200px extra vertical stretch
    } else {
      // Fallback: use document scroll height if footer not found
      height = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
      );
    }
    
    setPageHeight(height);
    setViewportHeight(window.innerHeight);
  }, []);

  // Optimized scroll handler - throttled via RAF to prevent excessive re-renders
  const handleScroll = useCallback(() => {
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        rafIdRef.current = null;
      });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    
    // Get header height for positioning canopy below header
    const header = document.querySelector('header, nav, [role="banner"]');
    if (header) {
      const headerRect = header.getBoundingClientRect();
      setHeaderHeight(headerRect.height);
    }
    
    // Load image to get its natural dimensions for aspect ratio calculation
    const img = new window.Image();
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      setImageAspectRatio(ratio);
    };
    img.onerror = () => {
      // Fallback if image fails to load - use reasonable default
      setImageAspectRatio(0.6); // Common tree aspect ratio
    };
    img.src = '/assets/images/cherry-tree.png';

    updateHeight();
    
    window.addEventListener('resize', updateHeight, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const resizeObserver = new ResizeObserver(() => {
      // Throttle ResizeObserver updates via RAF
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          updateHeight();
          rafIdRef.current = null;
        });
      }
    });
    
    if (document.body) {
      resizeObserver.observe(document.body);
    }
    
    // Also observe footer specifically to catch footer size changes
    const footerObserver = new ResizeObserver(() => {
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          updateHeight();
          rafIdRef.current = null;
        });
      }
    });
    
    let footerTimeoutId: NodeJS.Timeout | null = null;
    
    if (footerRef.current) {
      footerObserver.observe(footerRef.current);
    } else {
      // Try to find footer after a short delay (DOM might not be ready)
      footerTimeoutId = setTimeout(() => {
        footerRef.current = document.querySelector('footer');
        if (footerRef.current) {
          footerObserver.observe(footerRef.current);
        }
      }, 100);
    }

    return () => {
      if (footerTimeoutId !== null) {
        clearTimeout(footerTimeoutId);
      }
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      resizeObserver.disconnect();
      footerObserver.disconnect();
    };
  }, [updateHeight, handleScroll]);

  // Render immediately - don't wait for mount to avoid blank screen
  // The component will update dimensions once mounted

  // Memoize expensive calculations to prevent recalculation on every render
  const { imageHeight, imageWidth, imageTranslateY, transformString } = useMemo(() => {
    // Calculate: Image height should match page height (full image visible when scrolled)
    // Image will be taller than viewport, enabling scroll reveal
    const height = pageHeight; // Full page height - entire image spans page
    const width = height * imageAspectRatio; // Natural width at this height
    
    // Calculate scroll-based transform - move smoothly with page content
    // Use document scroll height for accurate calculation
    const documentHeight = typeof document !== 'undefined' ? document.documentElement.scrollHeight : pageHeight;
    const maxScroll = Math.max(0, documentHeight - viewportHeight);
    
    // Calculate how much the image needs to move to reveal full height
    const scrollRange = Math.max(0, height - viewportHeight);
    
    // Calculate scroll progress (0 to 1) - ensures smooth, proportional movement
    const scrollProgress = maxScroll > 0 
      ? Math.max(0, Math.min(1, scrollY / maxScroll))
      : 0;
    
    // Translate image upward proportionally to scroll progress
    // At scroll 0 (top): show top of image (translateY = 0)
    // At scroll max (bottom): show bottom of image (translateY = -imageScrollRange)
    // Direct 1:1 mapping ensures tree moves exactly with page content
    const translateY = scrollRange > 0
      ? -scrollProgress * scrollRange
      : 0;
    
    // Pre-compute transform string to avoid string concatenation on every render
    const transform = `scaleX(-1) translate3d(0, ${translateY}px, 0)`;
    
    return {
      imageHeight: height,
      imageWidth: width,
      imageTranslateY: translateY,
      transformString: transform,
    };
  }, [pageHeight, imageAspectRatio, viewportHeight, scrollY]);

  return (
    <div 
      className="fixed pointer-events-none"
      aria-hidden="true"
      style={{ 
        left: '-1300px', // Positioned far left - canopy overlaps header visually
        top: 0, // Start at very top of page - pink canopy begins at top
        margin: 0,
        padding: 0,
        width: `${imageWidth}px`, // Full image width - entire image visible
        height: `${viewportHeight}px`, // Full viewport height - this is the "window" that reveals the image
        overflow: 'hidden', // Clip to viewport - this creates the reveal effect
        zIndex: 0, // Behind header and footer, canopy can overlap header visually
      }}
    >
      <img
        src="/assets/images/cherry-tree.png"
        alt="Cherry Blossom Tree"
        style={{
          width: `${imageWidth}px`, // Full image width
          height: `${imageHeight}px`, // Full image height - spans entire page height
          objectFit: 'contain', // Maintain aspect ratio, show full image without cropping
          objectPosition: 'right top', // After flipping, anchor at right to show tree on left side
          display: 'block',
          margin: 0,
          padding: 0,
          transform: transformString, // Pre-computed transform string for better performance
          willChange: 'transform', // Optimize for animation
          backfaceVisibility: 'hidden', // Prevent flickering
        }}
      />
    </div>
  );
}
