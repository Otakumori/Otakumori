'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

/**
 * TreeBackgroundWrapper Component
 * 
 * CRITICAL: This component MUST only be used on the home page (app/page.tsx).
 * It will not render on any other route.
 * 
 * This wrapper:
 * - Fixes Next.js 15 SSR error by handling dynamic import in Client Component
 * - Enforces home-page-only rendering via pathname check
 * - Prevents TreeBackground from appearing on other routes
 */
const TreeBackground = dynamic(
  () => import('./TreeBackground'),
  {
    ssr: false, // CRITICAL: Prevent any server-side evaluation
    loading: () => (
      <div 
        className="fixed inset-x-0 pointer-events-none" 
        style={{ top: 0, height: '100vh', zIndex: -10 }}
        aria-hidden="true"
      />
    ),
  }
);

export default function TreeBackgroundWrapper() {
  const pathname = usePathname();
  
  // CRITICAL: Only render on home page - this prevents tree from appearing elsewhere
  if (pathname !== '/') {
    return null;
  }
  
  return <TreeBackground />;
}

