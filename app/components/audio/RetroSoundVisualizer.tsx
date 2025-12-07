/**
 * Retro Sound Visualizer
 * 8-bit/16-bit style sound visualization with pixel-art particle effects
 */

'use client';

import { logger } from '@/app/lib/logger';
import React, { useRef, useEffect, useState } from 'react';
import { useAudioStore } from '@/app/stores/audioStore';

interface ParticleProps {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  }

interface RetroSoundVisualizerProps {
  width?: number;
  height?: number;
  style?: '8bit' | '16bit' | 'modern';
  showFPS?: boolean;
}

export default function RetroSoundVisualizer({
  width = 400,
  height = 200,
  style = '16bit',
  showFPS = false,
}: RetroSoundVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioContext, playingSounds } = useAudioStore();
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [fps, setFps] = useState(0);
  const particlesRef = useRef<ParticleProps[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const framesRef = useRef<number>(0);

  // Create analyser node
  useEffect(() => {
    if (!audioContext || audioContext.state === 'closed') return;

    const analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = style === '8bit' ? 64 : style === '16bit' ? 256 : 1024;
    analyserNode.smoothingTimeConstant = 0.8;

    // Connect to audio context destination
    const destination = audioContext.destination;
    if (destination) {
      try {
        // We can't easily tap into the destination, so we'll just create the analyser
        // In a real implementation, you'd connect it properly to your audio graph
        setAnalyser(analyserNode);
      } catch (error) {
        logger.error('Failed to connect analyser:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
    }

    return () => {
      analyserNode.disconnect();
    };
  }, [audioContext, style]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser?.frequencyBinCount || 32;
    const dataArray = new Uint8Array(bufferLength);

    const animate = (currentTime: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Calculate FPS
      if (currentTime - lastTimeRef.current >= 1000) {
        setFps(framesRef.current);
        framesRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      framesRef.current++;

      // Clear canvas
      ctx.fillStyle = 'rgba(8, 6, 17, 0.2)'; // Fade effect
      ctx.fillRect(0, 0, width, height);

      // Get frequency data
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Simulate data when no analyser
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.random() * 50 + Math.sin(currentTime * 0.001 + i) * 20;
        }
      }

      // Draw based on style
      if (style === '8bit') {
        draw8BitStyle(ctx, dataArray, width, height);
      } else if (style === '16bit') {
        draw16BitStyle(ctx, dataArray, width, height);
      } else {
        drawModernStyle(ctx, dataArray, width, height);
      }

      // Update and draw particles
      updateParticles(ctx, dataArray);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, width, height, style]);

  // 8-bit visualization (blocky pixels)
  const draw8BitStyle = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    w: number,
    h: number,
  ) => {
    const barWidth = Math.floor(w / dataArray.length);
    const pixelSize = 8;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * h;
      const x = i * barWidth;

      // Pixelated bars
      const blocksY = Math.floor(barHeight / pixelSize);
      for (let j = 0; j < blocksY; j++) {
        const y = h - (j + 1) * pixelSize;
        const hue = (i / dataArray.length) * 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.fillRect(x, y, barWidth - 2, pixelSize - 2);

        // Add pixels
        if (dataArray[i] > 100 && Math.random() > 0.7) {
          spawnParticle(x + barWidth / 2, y, hue);
        }
      }
    }
  };

  // 16-bit visualization (smoother with gradients)
  const draw16BitStyle = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    w: number,
    h: number,
  ) => {
    const barWidth = w / dataArray.length;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * h;
      const x = i * barWidth;
      const y = h - barHeight;

      const hue = (i / dataArray.length) * 360;
      const gradient = ctx.createLinearGradient(x, y, x, h);
      gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.8)`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.3)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);

      // Spawn particles on peaks
      if (dataArray[i] > 150 && Math.random() > 0.8) {
        spawnParticle(x + barWidth / 2, y, hue);
      }
    }
  };

  // Modern visualization (smooth waveform)
  const drawModernStyle = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    w: number,
    h: number,
  ) => {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ec4899';
    ctx.beginPath();

    const sliceWidth = w / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 255;
      const y = v * h;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();
  };

  // Spawn particle
  const spawnParticle = (x: number, y: number, hue: number) => {
    const angle = (Math.random() - 0.5) * Math.PI;
    const speed = Math.random() * 2 + 1;

    particlesRef.current.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1,
      maxLife: 1,
      color: `hsl(${hue}, 100%, 60%)`,
      size: Math.random() * 3 + 2,
    });
  };

  // Update particles
  const updateParticles = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array) => {
    const avgVolume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const volumeMultiplier = Math.min(avgVolume / 128, 2); // Scale 0-2x

    particlesRef.current = particlesRef.current.filter((p) => {
      p.x += p.vx * volumeMultiplier;
      p.y += p.vy * volumeMultiplier;
      p.vy += 0.1 * volumeMultiplier; // Scale gravity by volume
      p.size = p.size * (1 + volumeMultiplier * 0.1); // Scale size by volume
      p.life -= 0.02;

      if (p.life > 0) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.globalAlpha = 1;
        return true;
      }
      return false;
    });

    // Limit particles
    if (particlesRef.current.length > 500) {
      particlesRef.current = particlesRef.current.slice(-500);
    }

    // Draw subtle glow based on average volume to visualize audio energy
    if (Number.isFinite(avgVolume) && avgVolume > 0) {
      const normalized = Math.min(avgVolume / 255, 1);
      ctx.save();
      ctx.globalAlpha = Math.min(0.35, normalized);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(0, ctx.canvas.height - 4, ctx.canvas.width, 4);
      ctx.restore();
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg border border-white/20 bg-[#080611]"
      />

      {showFPS && (
        <div className="absolute top-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          {fps} FPS
        </div>
      )}

      {Object.keys(playingSounds).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-white/50">No audio playing</p>
        </div>
      )}
    </div>
  );
}
