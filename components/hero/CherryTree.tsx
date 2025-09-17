"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import { useMediaQuery } from "@/hooks/useMediaQuery";

interface CherryTreeProps {
  swayIntensity?: number;
  onPetalSpawn?: (x: number, y: number) => void;
  className?: string;
}

const createRange = (count: number) => Array.from({ length: count }, (_, index) => index);

const LEFT_CLUSTER = createRange(8);
const RIGHT_CLUSTER = createRange(8);
const CENTER_CLUSTER = createRange(12);
const SHIMMER_POINTS = createRange(6);

export function CherryTree({ swayIntensity = 0.5, onPetalSpawn, className }: CherryTreeProps) {
  const [currentSway, setCurrentSway] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const treeRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (prefersReducedMotion) {
      setCurrentSway(0);
      return;
    }

    let frameId = 0;

    const sway = () => {
      const time = Date.now() * 0.001;
      const swayAmount = Math.sin(time * 0.3) * swayIntensity * 2;
      setCurrentSway(swayAmount);

      if (onPetalSpawn && Math.random() < 0.1) {
        const x = 50 + Math.random() * 20 - 10;
        const y = 30 + Math.random() * 20 - 10;
        onPetalSpawn(x, y);
      }

      frameId = requestAnimationFrame(sway);
    };

    frameId = requestAnimationFrame(sway);
    return () => cancelAnimationFrame(frameId);
  }, [onPetalSpawn, prefersReducedMotion, swayIntensity]);

  useEffect(() => {
    const element = treeRef.current;
    if (!element) {
      return () => undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setIsVisible(entry?.isIntersecting ?? true);
    },
    {
      threshold: 0.1,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const containerClassName = useMemo(
    () =>
      ["pointer-events-none absolute inset-0 overflow-hidden", className]
        .filter(Boolean)
        .join(" "),
    [className],
  );

  return (
    <div ref={treeRef} className={containerClassName} aria-hidden={!isVisible}>
      <motion.div
        className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 transform"
        style={{ transform: `translateX(${prefersReducedMotion ? 0 : currentSway}px)` }}
        animate={
          prefersReducedMotion || !isVisible
            ? undefined
            : {
                y: [0, -2, 0],
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
      >
        <div className="absolute bottom-0 left-1/2 h-32 w-8 -translate-x-1/2 transform rounded-full bg-gradient-to-t from-amber-800 to-amber-600" />

        <div className="absolute bottom-20 left-1/2 h-32 w-64 -translate-x-1/2 transform">
          <div className="absolute bottom-0 left-0 h-16 w-24 origin-bottom-left -rotate-45 transform rounded-full bg-gradient-to-r from-amber-700 to-amber-500" />
          <div className="absolute bottom-0 right-0 h-16 w-24 origin-bottom-right rotate-45 transform rounded-full bg-gradient-to-l from-amber-700 to-amber-500" />
          <div className="absolute bottom-0 left-1/2 h-20 w-16 -translate-x-1/2 transform rounded-full bg-gradient-to-t from-amber-700 to-amber-500" />
        </div>

        <div className="absolute bottom-16 left-1/2 h-40 w-80 -translate-x-1/2 transform">
          <div className="absolute bottom-0 left-0 h-32 w-32">
            {LEFT_CLUSTER.map((index) => (
              <motion.div
                key={`left-${index}`}
                className="absolute h-3 w-3 rounded-full bg-pink-300 opacity-80"
                style={{
                  left: `${20 + Math.sin(index * 0.8) * 15}%`,
                  top: `${30 + Math.cos(index * 0.8) * 15}%`,
                }}
                animate={
                  prefersReducedMotion || !isVisible
                    ? undefined
                    : {
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8],
                        transition: {
                          duration: 3 + index * 0.2,
                          repeat: Infinity,
                          delay: index * 0.1,
                          ease: "easeInOut",
                        },
                      }
                }
              />
            ))}
          </div>

          <div className="absolute bottom-0 right-0 h-32 w-32">
            {RIGHT_CLUSTER.map((index) => (
              <motion.div
                key={`right-${index}`}
                className="absolute h-3 w-3 rounded-full bg-pink-300 opacity-80"
                style={{
                  left: `${20 + Math.sin(index * 0.8) * 15}%`,
                  top: `${30 + Math.cos(index * 0.8) * 15}%`,
                }}
                animate={
                  prefersReducedMotion || !isVisible
                    ? undefined
                    : {
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8],
                        transition: {
                          duration: 3 + index * 0.2,
                          repeat: Infinity,
                          delay: index * 0.1 + 0.5,
                          ease: "easeInOut",
                        },
                      }
                }
              />
            ))}
          </div>

          <div className="absolute bottom-0 left-1/2 h-32 w-40 -translate-x-1/2 transform">
            {CENTER_CLUSTER.map((index) => (
              <motion.div
                key={`center-${index}`}
                className="absolute h-3 w-3 rounded-full bg-pink-200 opacity-90"
                style={{
                  left: `${25 + Math.sin(index * 0.5) * 20}%`,
                  top: `${20 + Math.cos(index * 0.5) * 20}%`,
                }}
                animate={
                  prefersReducedMotion || !isVisible
                    ? undefined
                    : {
                        scale: [1, 1.2, 1],
                        opacity: [0.9, 1, 0.9],
                        transition: {
                          duration: 2.5 + index * 0.15,
                          repeat: Infinity,
                          delay: index * 0.08,
                          ease: "easeInOut",
                        },
                      }
                }
              />
            ))}
          </div>
        </div>

        {!prefersReducedMotion && isVisible && (
          <div className="absolute inset-0">
            {SHIMMER_POINTS.map((index) => (
              <motion.div
                key={`shimmer-${index}`}
                className="absolute h-2 w-2 rounded-full bg-green-400 opacity-60"
                style={{
                  left: `${30 + Math.sin(index * 1.2) * 25}%`,
                  top: `${40 + Math.cos(index * 1.2) * 25}%`,
                }}
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: [1, 1.3, 1],
                  transition: {
                    duration: 4 + index * 0.3,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut",
                  },
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}