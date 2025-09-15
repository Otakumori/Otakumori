'use client';

import React, { useEffect, useRef } from 'react';

interface ParallaxBackgroundProps {
  speed?: number;
  backgroundImage?: string;
  className?: string;
}

const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  speed = 0.3,
  backgroundImage = '/assets/images/space-bg.jpg',
  className = '',
}) => {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;

    const updateParallax = () => {
      if (backgroundRef.current) {
        const scrollY = window.scrollY;
        const translateY = scrollY * speed;
        backgroundRef.current.style.transform = `translateY(${translateY}px)`;
      }
      animationId = requestAnimationFrame(updateParallax);
    };

    // Start the animation loop
    animationId = requestAnimationFrame(updateParallax);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [speed]);

  return (
    <div
      ref={backgroundRef}
      className={`parallax-bg ${className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      aria-hidden="true"
    />
  );
};

export default ParallaxBackground;
