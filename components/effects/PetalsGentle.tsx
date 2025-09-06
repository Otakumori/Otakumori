'use client';

import React from 'react';

interface PetalsGentleProps {
  density?: number;
  sway?: number;
}

export default function PetalsGentle({ density = 12, sway = 0.6 }: PetalsGentleProps) {
  // Generate petal elements with CSS animations
  const petals = Array.from({ length: density }, (_, i) => {
    const delay = Math.random() * 5; // 0-5s delay
    const duration = 9.5 + Math.random() * 2; // 9.5-11.5s duration
    const startX = Math.random() * 100; // 0-100% horizontal position
    const swayAmount = (Math.random() - 0.5) * sway * 20; // sway variation

    return (
      <div
        key={i}
        className="petal"
        style={{
          position: 'absolute',
          left: `${startX}%`,
          top: '-10px',
          width: `${4 + Math.random() * 8}px`,
          height: `${4 + Math.random() * 8}px`,
          backgroundColor: 'rgba(255, 192, 203, 0.7)',
          borderRadius: '50%',
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          transform: `translateX(${swayAmount}px)`,
        }}
      />
    );
  });

  return <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">{petals}</div>;
}
