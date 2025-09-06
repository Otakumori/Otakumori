'use client';

import { useEffect, useState } from 'react';

/** runtime guard */
function canUseWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); }
  catch { return false; }
}

// Simplified static tree component for now

export default function HomeTreeWind() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  }, []);

  // Tree fixed to viewport - no parallax scrolling
  return (
    <div aria-hidden className="fixed left-0 top-0 w-full h-screen -z-10 pointer-events-none">
      {/* Tree positioned to look like it's growing from the left edge */}
      <img 
        src="/media/cherry-tree.png" 
        alt="" 
        className="h-full w-auto object-cover object-left" 
        style={{
          transform: 'scaleX(2.0) scaleY(1.5)',
          transformOrigin: 'left center',
          marginLeft: '-30%',
          position: 'fixed',
          left: 0,
          top: 0
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
    </div>
  );
}
