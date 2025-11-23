'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseMobileControlsProps {
  setCameraRotation: (updater: (prev: { x: number; y: number }) => { x: number; y: number }) => void;
  setCameraZoom: (updater: (prev: number) => number) => void;
}

export function useMobileControls({ setCameraRotation, setCameraZoom }: UseMobileControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setIsDragging(false);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 10) {
        setIsDragging(true);

        // Handle camera rotation on touch
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe - rotate Y
          const rotationY = (deltaX / window.innerWidth) * 180;
          setCameraRotation((prev) => ({ ...prev, y: prev.y + rotationY * 0.1 }));
        } else {
          // Vertical swipe - rotate X
          const rotationX = (deltaY / window.innerHeight) * 180;
          setCameraRotation((prev) => ({ ...prev, x: prev.x + rotationX * 0.1 }));
        }
      }
    },
    [touchStart, setCameraRotation],
  );

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
    setIsDragging(false);
  }, []);

  // Pinch to zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (isMobile) {
        e.preventDefault();
        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        setCameraZoom((prev) => Math.max(0.5, Math.min(3, prev + zoomDelta)));
      }
    },
    [isMobile, setCameraZoom],
  );

  return {
    isMobile,
    isDragging,
    sidebarCollapsed,
    setSidebarCollapsed,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
  };
}

