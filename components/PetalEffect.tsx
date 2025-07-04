'use client';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useSound } from '../app/lib/hooks/useSound';
import { useHaptic } from '../app/lib/hooks/useHaptic';
import { useEffect } from 'react';

const petalFloat = {
  initial: { opacity: 0, y: 0, rotate: 0 },
  animate: {
    opacity: [0, 1, 1, 0],
    y: [0, -100, -200, -300],
    rotate: [0, 180, 360, 540],
    transition: { duration: 3, ease: 'easeOut' },
  },
};

interface PetalEffectProps {
  count?: number;
  color?: string;
  size?: number;
  duration?: number;
  interactive?: boolean;
  onCollect?: () => void;
}

export const PetalEffect = ({
  count = 8,
  color = '#FF69B4',
  size = 20,
  duration = 4,
  interactive = false,
  onCollect,
}: PetalEffectProps) => {
  const controls = useAnimation();
  const { playSound } = useSound();
  const { vibrate } = useHaptic();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive) return;
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handlePetalClick = (index: number) => {
    if (!interactive) return;

    playSound('petal');
    vibrate('light');
    onCollect?.();

    controls.start({
      scale: [1, 1.2, 0],
      opacity: [1, 1, 0],
      transition: { duration: 0.5 },
    });
  };

  useEffect(() => {
    if (interactive) {
      controls.start('animate');
    }
  }, [controls, interactive]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {Array.from({ length: count }).map((_, index) => {
        const x = useTransform(mouseX, [0, window.innerWidth], [-20, 20]);
        const y = useTransform(mouseY, [0, window.innerHeight], [-20, 20]);

        return (
          <motion.div
            key={index}
            className={`absolute ${interactive ? 'cursor-pointer' : ''}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              x: interactive ? x : 0,
              y: interactive ? y : 0,
            }}
            variants={petalFloat}
            initial="initial"
            animate={controls}
            custom={index}
            onClick={() => handlePetalClick(index)}
            whileHover={interactive ? { scale: 1.2 } : undefined}
            whileTap={interactive ? { scale: 0.8 } : undefined}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C15.31 2 18 4.69 18 8C18 11.31 15.31 14 12 14C8.69 14 6 11.31 6 8C6 4.69 8.69 2 12 2ZM12 0C7.58 0 4 3.58 4 8C4 12.42 7.58 16 12 16C16.42 16 20 12.42 20 8C20 3.58 16.42 0 12 0Z"
                fill={color}
                fillOpacity="0.6"
              />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
};
