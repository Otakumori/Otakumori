'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

interface CanopyProps {
  windDirection?: number;
  windSpeed?: number;
  className?: string;
}

const Canopy: React.FC<CanopyProps> = ({
  windDirection: _windDirection = 45,
  windSpeed = 1,
  className = '',
}) => {
  const [canopyBounds, setCanopyBounds] = useState({ x: 0, y: 0, width: 400, height: 300 });
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateBounds = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanopyBounds({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  // Animation effect for rotation
  useEffect(() => {
    const animate = () => {
      setRotation(Math.sin(Date.now() * 0.001) * windSpeed * 2);
      requestAnimationFrame(animate);
    };
    animate();
  }, [windSpeed]);

  // Expose bounds to parent components
  useEffect(() => {
    (window as any).canopyBounds = canopyBounds;
  }, [canopyBounds]);

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 left-0 w-full h-screen pointer-events-none z-0 canopy-background ${className}`}
    >
      {/* Tree Canopy Image */}
      <div
        className="absolute top-0 left-0 w-full h-full canopy-rotation"
        style={
          {
            '--rotation': `${rotation}deg`,
          } as React.CSSProperties
        }
      >
        <Image
          src="/media/cherry-tree.png"
          alt="Cherry blossom tree canopy"
          fill
          className="object-fill canopy-image"
          priority
        />
      </div>

      {/* Gradient mask for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent canopy-mask" />
    </div>
  );
};

export default Canopy;
