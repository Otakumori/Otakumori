'use client';

import { useEffect, useState } from 'react';
import { CANOPY_POINTS } from '@/app/components/tree/CherryTree';

/**
 * Hook to detect tree canopy area for petal spawning
 * 
 * Calculates the bounding box of the cherry tree canopy based on
 * the tree image position and normalized canopy points.
 */
export interface TreeArea {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export function useTreeCanopyArea(): TreeArea | undefined {
  const [treeArea, setTreeArea] = useState<TreeArea | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const calculateTreeArea = () => {
      // Find the tree image element
      const treeImg = document.querySelector('img[alt="Cherry Blossom Tree"]') as HTMLImageElement | null;
      if (!treeImg) {
        // Fallback: estimate based on typical tree position (left side, ~30% width)
        const width = window.innerWidth;
        const height = window.innerHeight;
        return {
          xMin: width * 0.05,
          xMax: width * 0.35,
          yMin: height * 0.1,
          yMax: height * 0.4,
        };
      }

      const rect = treeImg.getBoundingClientRect();
      
      // Calculate canopy bounds from normalized points
      // CANOPY_POINTS are normalized (0-1) relative to image dimensions
      const canopyXCoords = CANOPY_POINTS.map((p) => rect.left + p.x * rect.width);
      const canopyYCoords = CANOPY_POINTS.map((p) => rect.top + p.y * rect.height);

      // Add some padding around the canopy points for spawn area
      const paddingX = rect.width * 0.1;
      const paddingY = rect.height * 0.1;

      return {
        xMin: Math.min(...canopyXCoords) - paddingX,
        xMax: Math.max(...canopyXCoords) + paddingX,
        yMin: Math.min(...canopyYCoords) - paddingY,
        yMax: Math.max(...canopyYCoords) + paddingY,
      };
    };

    // Initial calculation
    const timeoutId = setTimeout(() => {
      setTreeArea(calculateTreeArea());
    }, 100); // Small delay to ensure tree is rendered

    // Update on resize
    window.addEventListener('resize', () => {
      setTreeArea(calculateTreeArea());
    });

    // Use MutationObserver to detect when tree loads
    const observer = new MutationObserver(() => {
      setTreeArea(calculateTreeArea());
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', () => {
        setTreeArea(calculateTreeArea());
      });
      observer.disconnect();
    };
  }, []);

  return treeArea;
}

