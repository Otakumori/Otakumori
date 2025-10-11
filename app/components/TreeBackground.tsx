'use client';

import { useEffect, useState } from 'react';

interface TreeBackgroundProps {
  className?: string;
}

export default function TreeBackground({ className = '' }: TreeBackgroundProps) {
  const [documentHeight, setDocumentHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => {
      const body = document.body;
      const html = document.documentElement;
      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight,
      );
      setDocumentHeight(height);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(document.body);

    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  if (documentHeight === 0) {
    return null;
  }

  return (
    <div
      className={`fixed left-0 top-0 pointer-events-none ${className}`}
      style={{
        width: '55%',
        height: `${documentHeight}px`,
        backgroundImage: 'url(/assets/images/cherry-tree.png)',
        backgroundPosition: 'left top',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        zIndex: 1,
      }}
    >
      {/* Gradient overlay for navbar blending */}
      <div
        className="absolute left-0 top-0 w-full"
        style={{
          height: '80px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)',
          zIndex: 2,
        }}
      />
    </div>
  );
}
