'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Branch {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  angle: number;
  depth: number;
  isVisible: boolean;
}

interface Blossom {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  isVisible: boolean;
}

export default function GrowingTree() {
  const [mounted, setMounted] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [blossoms, setBlossoms] = useState<Blossom[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const generateTree = () => {
      const newBranches: Branch[] = [];
      const newBlossoms: Blossom[] = [];

      // Tree trunk - extends from bottom to top
      const trunkHeight = window.innerHeight * 0.8;
      const trunkWidth = 40;
      const trunkX = window.innerWidth * 0.15; // Positioned on the left

      // Main trunk
      newBranches.push({
        id: 'trunk',
        x1: trunkX,
        y1: window.innerHeight - 50,
        x2: trunkX,
        y2: window.innerHeight - trunkHeight,
        thickness: trunkWidth,
        angle: -Math.PI / 2,
        depth: 0,
        isVisible: true,
      });

      // Generate branches recursively
      const generateBranches = (
        startX: number,
        startY: number,
        angle: number,
        length: number,
        thickness: number,
        depth: number,
        maxDepth: number,
      ) => {
        if (depth >= maxDepth || length < 20) return;

        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;

        // Only add branch if it's within viewport bounds
        if (endX > 0 && endX < window.innerWidth && endY > 0 && endY < window.innerHeight) {
          newBranches.push({
            id: `branch-${depth}-${startX}-${startY}`,
            x1: startX,
            y1: startY,
            x2: endX,
            y2: endY,
            thickness: Math.max(2, thickness),
            angle,
            depth,
            isVisible: true,
          });

          // Add blossoms along the branch
          if (depth > 1 && Math.random() > 0.3) {
            const blossomCount = Math.floor(length / 60);
            for (let i = 0; i < blossomCount; i++) {
              const t = (i + 1) / (blossomCount + 1);
              const blossomX = startX + Math.cos(angle) * length * t;
              const blossomY = startY + Math.sin(angle) * length * t;

              newBlossoms.push({
                id: `blossom-${depth}-${i}-${startX}`,
                x: blossomX,
                y: blossomY,
                size: Math.random() * 6 + 4,
                opacity: Math.random() * 0.6 + 0.4,
                isVisible: true,
              });
            }
          }

          // Recursive branches
          const branchAngle1 = angle + (Math.random() - 0.5) * 0.8;
          const branchAngle2 = angle - (Math.random() - 0.5) * 0.8;
          const newLength = length * (0.6 + Math.random() * 0.3);
          const newThickness = thickness * (0.7 + Math.random() * 0.2);

          generateBranches(endX, endY, branchAngle1, newLength, newThickness, depth + 1, maxDepth);
          generateBranches(endX, endY, branchAngle2, newLength, newThickness, depth + 1, maxDepth);
        }
      };

      // Generate main branches from trunk
      const trunkTopY = window.innerHeight - trunkHeight;
      const mainBranchCount = 4;

      for (let i = 0; i < mainBranchCount; i++) {
        const angle = -Math.PI / 2 + (i - mainBranchCount / 2) * 0.4;
        const length = 150 + Math.random() * 100;
        generateBranches(trunkX, trunkTopY, angle, length, 15, 1, 5);
      }

      // Add some branches that extend into the header area
      const headerBranches = 3;
      for (let i = 0; i < headerBranches; i++) {
        const y = 100 + i * 50;
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
        const length = 80 + Math.random() * 60;
        generateBranches(trunkX, y, angle, length, 8, 1, 3);
      }

      setBranches(newBranches);
      setBlossoms(newBlossoms);
    };

    generateTree();

    const handleResize = () => {
      generateTree();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" style={{ zIndex: 2 }}>
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Tree trunk gradient */}
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="50%" stopColor="#A0522D" />
            <stop offset="100%" stopColor="#8B4513" />
          </linearGradient>

          {/* Branch gradient */}
          <linearGradient id="branchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="100%" stopColor="#A0522D" />
          </linearGradient>

          {/* Cherry blossom gradient */}
          <radialGradient id="blossomGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB6C1" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FF69B4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF1493" stopOpacity="0.7" />
          </radialGradient>
        </defs>

        {/* Render branches */}
        {branches.map((branch, index) => (
          <motion.line
            key={branch.id}
            x1={branch.x1}
            y1={branch.y1}
            x2={branch.x2}
            y2={branch.y2}
            stroke={branch.depth === 0 ? 'url(#trunkGradient)' : 'url(#branchGradient)'}
            strokeWidth={branch.thickness}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 2 + branch.depth * 0.5,
              delay: index * 0.1,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Render blossoms */}
        {blossoms.map((blossom, index) => (
          <motion.circle
            key={blossom.id}
            cx={blossom.x}
            cy={blossom.y}
            r={blossom.size}
            fill="url(#blossomGradient)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: blossom.opacity }}
            transition={{
              duration: 1,
              delay: 1.5 + index * 0.05,
              ease: 'easeOut',
            }}
          />
        ))}
      </svg>
    </div>
  );
}
