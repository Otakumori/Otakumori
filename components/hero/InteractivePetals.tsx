'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface Petal {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  opacity: number;
  color: string;
}

interface InteractivePetalsProps {
  maxPetals?: number;
  className?: string;
}

export default function InteractivePetals({
  maxPetals = 30,
  className = '',
}: InteractivePetalsProps) {
  const { isSignedIn } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [collected, setCollected] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastCollectTime, setLastCollectTime] = useState(0);
  const [showComboText, setShowComboText] = useState(false);
  const dailyLimit = 100;
  const [reducedMotion, setReducedMotion] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const petalIdCounter = useRef(0);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    return () => {};
  }, []);

  // Spawn petals periodically
  useEffect(() => {
    if (reducedMotion || !canvasRef.current) return;

    const spawnInterval = setInterval(() => {
      if (petals.length < maxPetals) {
        const newPetal: Petal = {
          id: petalIdCounter.current++,
          x: Math.random() * (canvasRef.current?.width || 800),
          y: -50,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 0.5 + Math.random() * 1,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2,
          size: 4 + Math.random() * 3,
          opacity: 0.3 + Math.random() * 0.2,
          color: ['#FFC0CB', '#FFB6C1', '#FF69B4', '#FF1493'][Math.floor(Math.random() * 4)],
        };
        setPetals((prev) => [...prev, newPetal]);
      }
    }, 300);

    return () => clearInterval(spawnInterval);
  }, [petals.length, maxPetals, reducedMotion]);

  // Animation loop
  useEffect(() => {
    if (reducedMotion || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Resize canvas to match container
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw petals with physics
      const currentTime = Date.now();
      setPetals((prevPetals) => {
        return prevPetals
          .map((petal) => {
            // Physics simulation
            const deltaTime = 0.016; // ~60fps
            
            // Gravity (constant downward acceleration)
            const gravity = 0.3;
            const newVy = petal.vy + gravity * deltaTime;
            
            // Wind effect (sine wave for natural sway)
            const windTime = currentTime * 0.001;
            const windEffect = Math.sin((windTime * 0.5 + petal.id * 0.1) * 2) * 0.2;
            const newVx = petal.vx * 0.99 + windEffect; // Air resistance + wind
            
            // Update position
            const newPetal = {
              ...petal,
              vx: newVx,
              vy: newVy,
              x: petal.x + newVx * deltaTime * 60,
              y: petal.y + newVy * deltaTime * 60,
              rotation: petal.rotation + petal.rotationSpeed + windEffect * 0.5,
            };

            // Draw petal
            ctx.save();
            ctx.translate(newPetal.x, newPetal.y);
            ctx.rotate((newPetal.rotation * Math.PI) / 180);
            ctx.globalAlpha = newPetal.opacity;

            // Draw petal shape (simple circle with gradient)
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, newPetal.size);
            gradient.addColorStop(0, newPetal.color);
            gradient.addColorStop(0.7, newPetal.color + 'AA');
            gradient.addColorStop(1, newPetal.color + '00');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, newPetal.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            return newPetal;
          })
          .filter((petal) => petal.y < canvas.height + 100); // Remove petals that fall off screen
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [reducedMotion]);

  // Handle petal click/collection
  const handleCanvasClick = useCallback(
    async (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || collected >= dailyLimit) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check if click hit any petal
      const clickedPetalIndex = petals.findIndex((petal) => {
        const dx = clickX - petal.x;
        const dy = clickY - petal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < petal.size;
      });

      if (clickedPetalIndex !== -1) {
        // Remove collected petal
        setPetals((prev) => prev.filter((_, index) => index !== clickedPetalIndex));

        // Update combo
        const now = Date.now();
        const timeSinceLastCollect = now - lastCollectTime;

        if (timeSinceLastCollect < 1500) {
          // Within combo window
          setCombo((prev) => prev + 1);
          setShowComboText(true);
          setTimeout(() => setShowComboText(false), 1000);
        } else {
          setCombo(1);
        }

        setLastCollectTime(now);

        // Calculate petals earned (with combo multiplier)
        const multiplier = Math.min(combo, 5);
        const petalsEarned = 10 * Math.max(1, multiplier);

        setCollected((prev) => Math.min(prev + petalsEarned, dailyLimit));

        // Particle burst effect
        createParticleBurst(clickX, clickY);

        // Call API to add petals (if signed in)
        if (isSignedIn) {
          try {
            await fetch('/api/v1/petals/collect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: petalsEarned, source: 'homepage_collection' }),
            });
          } catch (error) {
            console.error('Failed to sync petal collection:', error);
          }
        }
      }
    },
    [petals, collected, dailyLimit, combo, lastCollectTime, isSignedIn],
  );

  // Particle burst effect
  const createParticleBurst = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create temporary particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 3 + Math.random() * 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      let px = x;
      let py = y;
      let life = 1;

      const animateParticle = () => {
        if (life <= 0) return;

        px += vx;
        py += vy;
        life -= 0.05;

        ctx.save();
        ctx.globalAlpha = life;
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        requestAnimationFrame(animateParticle);
      };

      animateParticle();
    }
  };

  if (reducedMotion) {
    return null;
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full cursor-pointer"
        style={{ touchAction: 'none' }}
      />

      {/* Combo indicator */}
      {showComboText && combo > 1 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div
            className="text-6xl font-bold text-pink-400 animate-pulse"
            style={{ textShadow: '0 0 20px rgba(255, 105, 180, 0.8)' }}
          >
            x{combo} COMBO!
          </div>
        </div>
      )}

      {/* Collection counter */}
      <div className="absolute bottom-4 right-4 glass-panel rounded-xl px-4 py-2 pointer-events-none">
        <div className="text-sm text-pink-200">Collected Today</div>
        <div className="text-2xl font-bold text-pink-100">
          {collected} / {dailyLimit}
        </div>
      </div>
    </div>
  );
}
