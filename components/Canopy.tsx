"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState } from "react";

interface CanopyProps {
  windDirection?: number;
  windSpeed?: number;
  className?: string;
}

export default function Canopy({ windDirection = 45, windSpeed = 1, className }: CanopyProps) {
  const [canopyBounds, setCanopyBounds] = useState({ x: 0, y: 0, width: 400, height: 300 });
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const updateBounds = () => {
      const element = containerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      setCanopyBounds({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, []);

  useEffect(() => {
    const animate = () => {
      const time = Date.now() * 0.001;
      const directionalFactor = Math.cos((windDirection * Math.PI) / 180);
      setRotation(Math.sin(time * 0.3) * windSpeed * 2 * directionalFactor);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [windDirection, windSpeed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as Window & { canopyBounds?: typeof canopyBounds }).canopyBounds = canopyBounds;
  }, [canopyBounds]);

  const containerClassName = [
    "fixed top-0 left-0 h-screen w-full pointer-events-none z-0 canopy-background",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={containerRef} className={containerClassName}>
      <div
        className="absolute inset-0 canopy-rotation"
        style={{ "--rotation": `${rotation}deg` } as CSSProperties}
      >
        <Image
          src="/media/cherry-tree.png"
          alt="Cherry blossom tree canopy"
          fill
          className="canopy-image object-fill"
          priority
        />
      </div>
      <div className="absolute inset-0 canopy-mask bg-gradient-to-r from-black/20 via-transparent to-transparent" />
    </div>
  );
}