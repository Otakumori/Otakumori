/**
 * High-DPI Canvas Utilities
 * 
 * Provides helpers for sizing canvas/render targets using devicePixelRatio correctly.
 * Ensures canvas internal buffer equals CSS size * DPR with no CSS stretch blur.
 */

import React from 'react';

/**
 * Get the device pixel ratio, with fallback for SSR
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
}

/**
 * Size a canvas element for high-DPI displays
 * 
 * @param canvas - The canvas element to size
 * @param cssWidth - CSS width in pixels (display size)
 * @param cssHeight - CSS height in pixels (display size)
 * @param dpr - Device pixel ratio (defaults to window.devicePixelRatio)
 * @returns The 2D rendering context, scaled appropriately
 */
export function sizeCanvasForHiDpi(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
  dpr: number = getDevicePixelRatio(),
): CanvasRenderingContext2D | null {
  // Set internal buffer size (actual pixels)
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  // Set CSS display size (logical pixels)
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  // Get context and scale it
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Scale context so 1 unit = 1 CSS pixel
    ctx.scale(dpr, dpr);
    
    // Set rendering hints for crisp rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  return ctx;
}

/**
 * Size a canvas based on its container's bounding rect
 * 
 * @param canvas - The canvas element to size
 * @param container - The container element (defaults to canvas's parent)
 * @param dpr - Device pixel ratio (defaults to window.devicePixelRatio)
 * @returns Object with context, CSS dimensions, and DPR
 */
export function sizeCanvasFromContainer(
  canvas: HTMLCanvasElement,
  container?: HTMLElement | null,
  dpr: number = getDevicePixelRatio(),
): {
  ctx: CanvasRenderingContext2D | null;
  cssWidth: number;
  cssHeight: number;
  dpr: number;
} {
  const targetContainer = container || canvas.parentElement;
  if (!targetContainer) {
    // Fallback to canvas's current size if no container
    const rect = canvas.getBoundingClientRect();
    const ctx = sizeCanvasForHiDpi(canvas, rect.width, rect.height, dpr);
    return {
      ctx,
      cssWidth: rect.width,
      cssHeight: rect.height,
      dpr,
    };
  }

  const rect = targetContainer.getBoundingClientRect();
  const cssWidth = rect.width;
  const cssHeight = rect.height;

  const ctx = sizeCanvasForHiDpi(canvas, cssWidth, cssHeight, dpr);

  return {
    ctx,
    cssWidth,
    cssHeight,
    dpr,
  };
}

/**
 * Throttle function for resize observers
 */
function throttle<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): T {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  const throttled = ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  }) as T;

  return throttled;
}

/**
 * Hook to observe container size changes with throttling
 * 
 * @param containerRef - Ref to the container element
 * @param callback - Callback called with { width, height } when size changes
 * @param throttleMs - Throttle delay in milliseconds (default: 100ms)
 * @returns Current size { width, height } or null if container not available
 */
export function useResizeObserver(
  containerRef: React.RefObject<HTMLElement>,
  callback?: (size: { width: number; height: number }) => void,
  throttleMs: number = 100,
): { width: number; height: number } | null {
  // This is a utility function, not a React hook
  // For React hook version, see useResizeObserverHook below
  if (typeof window === 'undefined' || !containerRef.current) {
    return null;
  }

  const container = containerRef.current;
  const rect = container.getBoundingClientRect();

  if (callback) {
    const throttledCallback = throttle(callback, throttleMs);
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        throttledCallback({ width, height });
      }
    });

    resizeObserver.observe(container);

    // Return cleanup function would be handled by useEffect in hook version
    return { width: rect.width, height: rect.height };
  }

  return { width: rect.width, height: rect.height };
}

/**
 * React hook version of useResizeObserver
 * 
 * @param containerRef - Ref to the container element
 * @param throttleMs - Throttle delay in milliseconds (default: 100ms)
 * @returns Current size { width, height } or null if container not available
 */
export function useResizeObserverHook(
  containerRef: React.RefObject<HTMLElement>,
  throttleMs: number = 100,
): { width: number; height: number } | null {
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const updateSize = throttle((width: number, height: number) => {
      setSize({ width, height });
    }, throttleMs);

    // Initial size
    const rect = container.getBoundingClientRect();
    updateSize(rect.width, rect.height);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        updateSize(width, height);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, throttleMs]);

  return size;
}

