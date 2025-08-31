/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
import { usePetals } from '@/lib/hooks/usePetals';
import { useAchievements } from '@/lib/hooks/useAchievements';
import { useAudio } from '@/lib/hooks/useAudio';

interface Petal {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  collected: boolean;
}

export const CherryBlossomTree = () => {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  const { addPetal } = usePetals();
  const { checkAchievements } = useAchievements();
  const { play: playPetalCollectSound } = useAudio('/assets/sounds/petal-collect.mp3');

  // Animation spring for the tree
  const treeSpring = useSpring({
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: inView ? 1 : 0, scale: inView ? 1 : 0.9 },
    config: { tension: 280, friction: 60 },
  });

  // Generate initial petals
  useEffect(() => {
    if (inView && containerRef.current) {
      const generatePetal = (): Petal => ({
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        collected: false,
      });

      const initialPetals = Array.from({ length: 30 }, generatePetal);
      setPetals(initialPetals);
    }
  }, [inView]);

  // Animate petals
  useEffect(() => {
    if (!inView) return;

    const interval = setInterval(() => {
      setPetals((currentPetals) =>
        currentPetals.map((petal) => {
          if (petal.collected) return petal;

          return {
            ...petal,
            y: (petal.y + 0.2) % 100,
            x: petal.x + Math.sin(petal.y * 0.1) * 0.5,
            rotation: petal.rotation + 1,
          };
        }),
      );
    }, 50);

    return () => clearInterval(interval);
  }, [inView]);

  const handlePetalClick = (petal: Petal) => {
    if (petal.collected) return;

    setPetals((currentPetals) =>
      currentPetals.map((p) => (p.id === petal.id ? { ...p, collected: true } : p)),
    );

    setCollectedCount((prev) => {
      const newCount = prev + 1;
      addPetal();
      checkAchievements(newCount);
      playPetalCollectSound();
      return newCount;
    });
  };

  return (
    <div
      ref={inViewRef}
      className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800"
    >
      <animated.div
        ref={containerRef}
        style={treeSpring}
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Tree Image */}
        <img
          src="/assets/cherry.jpg"
          alt="Cherry Blossom Tree"
          className="h-full w-full object-cover"
        />

        {/* Interactive Petals */}
        {petals.map((petal) => (
          <animated.div
            key={petal.id}
            onClick={() => handlePetalClick(petal)}
            className={`absolute cursor-pointer transition-opacity duration-500 ${
              petal.collected ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              left: `${petal.x}%`,
              top: `${petal.y}%`,
              transform: `rotate(${petal.rotation}deg) scale(${petal.scale})`,
            }}
          >
            <img src="/assets/petal.png" alt="Cherry Blossom Petal" className="h-4 w-4" />
          </animated.div>
        ))}

        {/* Collection Counter */}
        <div className="absolute bottom-8 left-8 rounded-lg bg-black/50 p-4 text-white">
          <p className="text-lg font-medium">Petals Collected: {collectedCount}</p>
        </div>
      </animated.div>
    </div>
  );
};
