'use client';

import { useEffect, useRef } from 'react';

interface Petal {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  fallSpeed: number;
  driftSpeed: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

export default function FallingPetals() {
  const containerRef = useRef<HTMLDivElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const nextIdRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createPetal = (): Petal => {
      const colors = [
        'rgba(255, 182, 193, 0.8)', // Light pink
        'rgba(255, 192, 203, 0.7)', // Pink
        'rgba(255, 105, 180, 0.6)', // Hot pink
        'rgba(255, 20, 147, 0.5)', // Deep pink
        'rgba(255, 160, 200, 0.7)', // Medium pink
      ];

      return {
        id: nextIdRef.current++,
        x: Math.random() * window.innerWidth,
        y: -50 - Math.random() * 100,
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        fallSpeed: Math.random() * 2 + 1,
        driftSpeed: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.6 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#FF6B9D',
        life: 0,
        maxLife: Math.random() * 300 + 200,
      };
    };

    const updatePetal = (petal: Petal): Petal => {
      return {
        ...petal,
        y: petal.y + petal.fallSpeed,
        x: petal.x + petal.driftSpeed + Math.sin(petal.life * 0.01) * 0.3,
        rotation: petal.rotation + petal.rotationSpeed,
        life: petal.life + 1,
        opacity: petal.opacity * (1 - petal.life / petal.maxLife),
      };
    };

    const renderPetal = (petal: Petal) => {
      const element = document.getElementById(`petal-${petal.id}`);
      if (!element) return;

      element.style.transform = `translate(${petal.x}px, ${petal.y}px) rotate(${petal.rotation}rad)`;
      element.style.opacity = petal.opacity.toString();
    };

    const createPetalElement = (petal: Petal) => {
      const element = document.createElement('div');
      element.id = `petal-${petal.id}`;
      element.className = 'absolute pointer-events-none';
      element.style.cssText = `
        width: ${petal.size}px;
        height: ${petal.size * 0.7}px;
        background: ${petal.color};
        border-radius: ${petal.size}px ${petal.size}px ${petal.size * 0.2}px ${petal.size * 0.8}px;
        box-shadow: 0 0 ${petal.size * 0.5}px ${petal.color};
        transform: translate(${petal.x}px, ${petal.y}px) rotate(${petal.rotation}rad);
        opacity: ${petal.opacity};
        will-change: transform, opacity;
      `;
      container.appendChild(element);
    };

    const animate = () => {
      // Update existing petals
      petalsRef.current = petalsRef.current.map(updatePetal).filter((petal) => {
        if (petal.life >= petal.maxLife || petal.y > window.innerHeight + 100) {
          const element = document.getElementById(`petal-${petal.id}`);
          if (element) element.remove();
          return false;
        }
        renderPetal(petal);
        return true;
      });

      // Spawn new petals occasionally
      if (Math.random() < 0.02) {
        const newPetal = createPetal();
        petalsRef.current.push(newPetal);
        createPetalElement(newPetal);
      }

      requestAnimationFrame(animate);
    };

    // Initial burst of petals
    for (let i = 0; i < 15; i++) {
      const petal = createPetal();
      petalsRef.current.push(petal);
      createPetalElement(petal);
    }

    animate();

    return () => {
      // Clean up all petal elements
      petalsRef.current.forEach((petal) => {
        const element = document.getElementById(`petal-${petal.id}`);
        if (element) element.remove();
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-1 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    />
  );
}
