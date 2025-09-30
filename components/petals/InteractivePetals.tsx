'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { petalShopHandler } from '@/lib/petalsGame';
import {
  WindController,
  PetalSpawner,
  createPetalElement,
  updatePetalTransform,
  isPetalOffScreen,
  resetPetalToCanopy,
} from '@/lib/petalsAnim';

interface InteractivePetalsProps {
  maxPetals?: number;
  spawnRate?: number; // petals per second
  petalColor?: string;
}

const InteractivePetals: React.FC<InteractivePetalsProps> = ({
  maxPetals = 40,
  spawnRate = 0.5,
  petalColor = '#F7BFD3',
}) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const lastSpawnRef = useRef<number>(0);
  const windControllerRef = useRef(new WindController());
  const spawnerRef = useRef(new PetalSpawner());
  const [petals, setPetals] = useState<
    Array<{
      id: string;
      element: HTMLDivElement;
      physics: any;
      spawnX: number;
      spawnY: number;
    }>
  >([]);

  // Safety check - unmount if not on home page
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      console.warn('⚠️ InteractivePetals mounted outside home page - unmounting');
      return () => {
        // Component will unmount
      };
    }
  }, []);

  // Initialize petal shop handler
  useEffect(() => {
    petalShopHandler.start();
    return () => {
      petalShopHandler.stop();
    };
  }, []);

  // Update canopy bounds when available
  useEffect(() => {
    const updateBounds = () => {
      const bounds = (window as any).canopyBounds;
      if (bounds) {
        spawnerRef.current.setCanopyBounds(bounds);
      }
    };

    updateBounds();
    const interval = setInterval(updateBounds, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePetalClick = useCallback((petalId: string) => {
    const reward = petalShopHandler.collectPetal(petalId);
    if (reward) {
      console.log('Petal collected:', reward);
    }
  }, []);

  const spawnPetal = useCallback(() => {
    if (petals.length >= maxPetals) return;

    const { x, y, physics } = spawnerRef.current.spawnPetal();
    const id = `petal_${Date.now()}_${Math.random()}`;

    console.log('Spawning petal at:', x, y);

    const element = createPetalElement(x, y, petalColor, true);
    element.addEventListener('click', () => handlePetalClick(id));

    setPetals((prev) => {
      const newPetals = [
        ...prev,
        {
          id,
          element,
          physics,
          spawnX: x,
          spawnY: y,
        },
      ];
      console.log('Total petals:', newPetals.length);
      return newPetals;
    });
  }, [petals.length, maxPetals, petalColor, handlePetalClick]);

  const updatePetals = useCallback((deltaTime: number) => {
    const wind = windControllerRef.current.update(deltaTime);

    setPetals((prev) =>
      prev.map((petal) => {
        // Apply wind physics
        const newPhysics = windControllerRef.current.applyWind(petal.physics, wind, deltaTime);

        // Update position
        newPhysics.x += newPhysics.vx * deltaTime;
        newPhysics.y += newPhysics.vy * deltaTime;
        newPhysics.rotation += newPhysics.rotationSpeed;
        newPhysics.flipAngle += newPhysics.flipSpeed;

        // Update DOM element
        updatePetalTransform(petal.element, newPhysics);

        // Recycle if off screen
        if (isPetalOffScreen(newPhysics, window.innerHeight)) {
          const resetPhysics = resetPetalToCanopy(newPhysics, petal.spawnX, petal.spawnY);
          updatePetalTransform(petal.element, resetPhysics);
          return { ...petal, physics: resetPhysics };
        }

        return { ...petal, physics: newPhysics };
      }),
    );
  }, []);

  // Animation loop
  useEffect(() => {
    let lastTime = 0;

    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      // Spawn new petals
      if (time - lastSpawnRef.current > 1000 / spawnRate) {
        spawnPetal();
        lastSpawnRef.current = time;
      }

      // Update existing petals
      updatePetals(deltaTime);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [spawnPetal, updatePetals, spawnRate]);

  // Mount petal elements to DOM
  useEffect(() => {
    if (!containerRef.current) {
      console.log('No container ref available');
      return;
    }

    console.log('Mounting', petals.length, 'petals to DOM');

    petals.forEach((petal) => {
      if (!containerRef.current?.contains(petal.element)) {
        containerRef.current?.appendChild(petal.element);
        console.log('Mounted petal element');
      }
    });

    return () => {
      petals.forEach((petal) => {
        if (petal.element.parentNode) {
          petal.element.parentNode.removeChild(petal.element);
        }
      });
    };
  }, [petals]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      petals.forEach((petal) => {
        if (petal.element.parentNode) {
          petal.element.parentNode.removeChild(petal.element);
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        pointerEvents: 'none',
        zIndex: 1000,
        background: 'transparent',
      }}
    >
      {/* Petal elements are dynamically added here */}
    </div>
  );
};

export default InteractivePetals;
