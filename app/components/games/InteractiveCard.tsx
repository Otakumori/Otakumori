'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useState } from 'react';

interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function InteractiveCard({ children, onClick }: InteractiveCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    rotateX.set(-mouseY / 10);
    rotateY.set(mouseX / 10);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative cursor-pointer perspective-1000"
    >
      <motion.div
        animate={{
          boxShadow: isHovered
            ? '0 20px 40px rgba(236, 72, 153, 0.3)'
            : '0 10px 20px rgba(0, 0, 0, 0.2)',
        }}
        className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-lg p-6"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

