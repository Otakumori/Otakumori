/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CherryBlossomEffect({ isActive, containerRef }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef?.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    const resizeCanvas = () => {
      canvas.width = containerRect.width;
      canvas.height = containerRect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Enhanced particle properties for more natural movement
    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: -10,
      size: Math.random() * 4 + 3, // Larger petals
      speed: Math.random() * 1.5 + 0.5, // Slower fall speed
      angle: Math.random() * Math.PI * 2,
      rotation: Math.random() * 0.1 - 0.05, // Gentler rotation
      opacity: Math.random() * 0.3 + 0.7, // More visible
      sway: Math.random() * 0.8 - 0.4, // More pronounced sway
      swaySpeed: Math.random() * 0.015 + 0.005, // Slower sway
      swayAngle: Math.random() * Math.PI * 2,
      color: `rgba(255, ${Math.floor(Math.random() * 50 + 150)}, ${Math.floor(Math.random() * 50 + 150)}, `, // Varied pink shades
      scale: Math.random() * 0.5 + 0.75, // Random size variation
    });

    // Initialize particles
    particlesRef.current = Array.from({ length: 40 }, createParticle);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update position with enhanced swaying motion
        particle.y += particle.speed;
        particle.swayAngle += particle.swaySpeed;
        particle.x += Math.sin(particle.swayAngle) * particle.sway;
        particle.angle += particle.rotation;

        // Draw petal with more natural shape and gradient
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.angle);
        ctx.scale(particle.scale, particle.scale);

        // Create gradient for each petal
        const gradient = ctx.createLinearGradient(0, -particle.size, 0, particle.size);
        gradient.addColorStop(0, `${particle.color}0.9)`);
        gradient.addColorStop(1, `${particle.color}0.5)`);
        ctx.fillStyle = gradient;

        // Draw more natural petal shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
          -particle.size,
          -particle.size * 0.3,
          -particle.size * 0.7,
          particle.size * 0.8,
          0,
          particle.size * 1.2,
        );
        ctx.bezierCurveTo(
          particle.size * 0.7,
          particle.size * 0.8,
          particle.size,
          -particle.size * 0.3,
          0,
          0,
        );
        ctx.fill();

        // Add subtle shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.restore();

        // Reset particle if it goes off screen
        if (particle.y > canvas.height) {
          particlesRef.current[index] = createParticle();
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, containerRef]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0"
        >
          <canvas ref={canvasRef} className="h-full w-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
