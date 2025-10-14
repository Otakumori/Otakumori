'use client';

import { useEffect, useState } from 'react';

export function SoapstoneGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(236, 72, 153, 0.08), transparent 40%)`,
      }}
      aria-hidden="true"
    />
  );
}
