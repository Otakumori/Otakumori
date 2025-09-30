'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

interface BranchProps {
  x: number;
  y: number;
  angle: number;
  length: number;
  thickness: number;
  depth: number;
  maxDepth: number;
}

function Branch({ x, y, angle, length, thickness, depth, maxDepth }: BranchProps) {
  const endX = x + Math.cos(angle) * length;
  const endY = y + Math.sin(angle) * length;
  const blossomCount = Math.max(1, Math.floor(length / 40));
  const blossomOffsets = useMemo(
    () => Array.from({ length: blossomCount }, (_, index) => index),
    [blossomCount],
  );
  const childAngles = useMemo(
    () => ({
      left: 0.3 + Math.random() * 0.4,
      right: 0.3 + Math.random() * 0.4,
    }),
    [],
  );

  const branchVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 0.8 + depth * 0.2,
        ease: 'easeOut' as const,
      },
    },
  };

  const blossomVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 0.8,
      transition: {
        delay: 0.5 + depth * 0.1,
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <g>
      <motion.line
        x1={x}
        y1={y}
        x2={endX}
        y2={endY}
        stroke="#8B4513"
        strokeWidth={thickness}
        strokeLinecap="round"
        variants={branchVariants}
        initial="hidden"
        animate="visible"
      />

      {depth < 3 && (
        <>
          {blossomOffsets.map((offset) => {
            const blossomX = x + Math.cos(angle) * (offset * 40 + 20);
            const blossomY = y + Math.sin(angle) * (offset * 40 + 20);
            return (
              <motion.circle
                key={`blossom-${depth}-${offset}-${length}`}
                cx={blossomX}
                cy={blossomY}
                r={8 + Math.random() * 4}
                fill="url(#cherryBlossomGradient)"
                variants={blossomVariants}
                initial="hidden"
                animate="visible"
              />
            );
          })}
        </>
      )}

      {depth < maxDepth && (
        <>
          <Branch
            x={endX}
            y={endY}
            angle={angle + childAngles.left}
            length={length * 0.7}
            thickness={thickness * 0.8}
            depth={depth + 1}
            maxDepth={maxDepth}
          />
          <Branch
            x={endX}
            y={endY}
            angle={angle - childAngles.right}
            length={length * 0.7}
            thickness={thickness * 0.8}
            depth={depth + 1}
            maxDepth={maxDepth}
          />
        </>
      )}
    </g>
  );
}

export default function AnimatedTree() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax meet">
        <defs>
          <radialGradient id="cherryBlossomGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB6C1" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FF69B4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF1493" stopOpacity="0.7" />
          </radialGradient>

          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="50%" stopColor="#A0522D" />
            <stop offset="100%" stopColor="#8B4513" />
          </linearGradient>
        </defs>

        <motion.rect
          x={50}
          y={600}
          width={60}
          height={200}
          fill="url(#trunkGradient)"
          rx={30}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        <Branch
          x={80}
          y={650}
          angle={-Math.PI / 2 - 0.3}
          length={200}
          thickness={25}
          depth={0}
          maxDepth={4}
        />
        <Branch
          x={80}
          y={650}
          angle={-Math.PI / 2 + 0.3}
          length={180}
          thickness={20}
          depth={0}
          maxDepth={4}
        />
        <Branch
          x={80}
          y={650}
          angle={-Math.PI / 2}
          length={150}
          thickness={15}
          depth={0}
          maxDepth={3}
        />

        {Array.from({ length: 20 }).map((_, index) => (
          <motion.circle
            key={`petal-${index}`}
            cx={100 + Math.random() * 300}
            cy={200 + Math.random() * 400}
            r={3 + Math.random() * 2}
            fill="url(#cherryBlossomGradient)"
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
              y: [0, -100 - Math.random() * 200],
              x: [0, (Math.random() - 0.5) * 100],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeOut' as const,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
