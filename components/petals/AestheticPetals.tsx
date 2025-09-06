'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WindController, PetalSpawner, createPetalElement, updatePetalTransform, isPetalOffScreen, resetPetalToCanopy } from '@/lib/petalsAnim';

interface AestheticPetalsProps {
  maxPetals?: number;
  spawnRate?: number; // petals per second
  petalColor?: string;
}

const AestheticPetals: React.FC<AestheticPetalsProps> = ({
  maxPetals = 20,
  spawnRate = 0.3,
  petalColor = '#F7BFD3'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastSpawnRef = useRef<number>(0);
  const windControllerRef = useRef(new WindController());
  const spawnerRef = useRef(new PetalSpawner());
  const [petals, setPetals] = useState<Array<{
    id: string;
    element: HTMLDivElement;
    physics: any;
    spawnX: number;
    spawnY: number;
  }>>([]);

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

  const spawnPetal = useCallback(() => {
    if (petals.length >= maxPetals) return;

    const { x, y, physics } = spawnerRef.current.spawnPetal();
    const id = `aesthetic_petal_${Date.now()}_${Math.random()}`;
    
    // Create non-interactive petal
    const element = createPetalElement(x, y, petalColor, false);
    
    setPetals(prev => [...prev, {
      id,
      element,
      physics,
      spawnX: x,
      spawnY: y
    }]);
  }, [petals.length, maxPetals, petalColor]);

  const updatePetals = useCallback((deltaTime: number) => {
    const wind = windControllerRef.current.update(deltaTime);
    
    setPetals(prev => prev.map(petal => {
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
    }));
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
    if (!containerRef.current) return;
    
    petals.forEach(petal => {
      if (!containerRef.current?.contains(petal.element)) {
        containerRef.current?.appendChild(petal.element);
      }
    });
    
    return () => {
      petals.forEach(petal => {
        if (petal.element.parentNode) {
          petal.element.parentNode.removeChild(petal.element);
        }
      });
    };
  }, [petals]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      petals.forEach(petal => {
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
        zIndex: 100,
        background: 'transparent'
      }}
    >
      {/* Petal elements are dynamically added here */}
    </div>
  );
};

export default AestheticPetals;
