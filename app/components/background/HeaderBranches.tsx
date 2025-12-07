'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface HeaderBranch {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  angle: number;
  isVisible: boolean;
  metadata?: { itemName?: string; index?: number };
  }

export default function HeaderBranches() {
  const [mounted, setMounted] = useState(false);
  const [branches, setBranches] = useState<HeaderBranch[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const generateHeaderBranches = () => {
      const newBranches: HeaderBranch[] = [];
      const trunkX = window.innerWidth * 0.15; // Same as main tree trunk position

      // Create branches that extend from the tree into header sections
      const headerHeight = 80; // Approximate header height
      const branchCount = 8;

      for (let i = 0; i < branchCount; i++) {
        const y = headerHeight + i * 15;
        const angle = Math.PI / 6 + (Math.random() - 0.5) * 0.4; // Slight upward angle
        const length = 60 + Math.random() * 40;
        const thickness = 3 + Math.random() * 2;

        const endX = trunkX + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;

        // Only add branch if it extends into the header area
        if (endX > 0 && endX < window.innerWidth && endY < headerHeight + 100) {
          newBranches.push({
            id: `header-branch-${i}`,
            x1: trunkX,
            y1: y,
            x2: endX,
            y2: endY,
            thickness,
            angle,
            isVisible: true,
          });
        }
      }

      // Add some smaller twigs that extend into navigation items
      const navItems = ['Home', 'Shop', 'Mini-Games', 'Blog', 'About Me'];
      navItems.forEach((item, index) => {
        const navX = (window.innerWidth / navItems.length) * (index + 0.5);
        const twigLength = 20 + Math.random() * 15;
        const twigAngle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;

        newBranches.push({
          id: `nav-twig-${index}`,
          x1: navX - 50 + Math.random() * 100,
          y1: headerHeight + 10,
          x2: trunkX + 20 + Math.cos(twigAngle) * twigLength,
          y2: headerHeight + 10 + Math.sin(twigAngle) * twigLength,
          thickness: 1 + Math.random(),
          angle: twigAngle,
          isVisible: true,
          metadata: { itemName: item, index },
        });
      });

      setBranches(newBranches);
    };

    generateHeaderBranches();

    const handleResize = () => {
      generateHeaderBranches();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-10 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Branch gradient for header branches */}
          <linearGradient id="headerBranchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="100%" stopColor="#A0522D" />
          </linearGradient>
        </defs>

        {/* Render header branches */}
        {branches.map((branch, index) => (
          <motion.line
            key={branch.id}
            x1={branch.x1}
            y1={branch.y1}
            x2={branch.x2}
            y2={branch.y2}
            stroke="url(#headerBranchGradient)"
            strokeWidth={branch.thickness}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{
              duration: 1.5 + index * 0.1,
              delay: 2.5 + index * 0.05,
              ease: 'easeOut',
            }}
          />
        ))}
      </svg>
    </div>
  );
}
