'use client';

import { useEffect } from 'react';

/**
 * Restores browser scroll position when navigating back/forward
 * This fixes the issue where back button returns to bottom of page
 */
export default function ScrollRestoration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Enable automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }

    // Remove any aggressive scroll-to-top calls that might interfere
    // This ensures the browser's native scroll restoration works properly
  }, []);

  return null;
}
