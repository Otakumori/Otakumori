'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAchievements } from '@/lib/hooks/useAchievements';
import Image from 'next/image';

interface Petal {
  id: number;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  sliced: boolean;
  type: 'cherry' | 'sakura' | 'golden';
}

interface Slice {
  id: number;
  x: number;
  y: number;
  angle: number;
  timestamp: number;
}

const PETAL = '°❀.ೃ࿔* ';
const NINJA = '忍者';
const PETAL_COUNT = 10;
const MUSIC_SRC = '/sounds/games/petal-samurai.mp3';
const FEMALE_SKIN =
  '/assets/sprites/GandalfHardcore Character Asset Pack/GandalfHardcore Character Asset Pack/Character skin colors/Female Skin1.png';
const FEMALE_HAIR =
  '/assets/sprites/GandalfHardcore Character Asset Pack/GandalfHardcore Character Asset Pack/Female Hair/Female Hair1.png';
const FEMALE_CLOTHING =
  '/assets/sprites/GandalfHardcore Character Asset Pack/GandalfHardcore Character Asset Pack/Female Clothing/Corset.png';
const FEMALE_BOOTS =
  '/assets/sprites/GandalfHardcore Character Asset Pack/GandalfHardcore Character Asset Pack/Female Clothing/Boots.png';
const FEMALE_SWORD =
  '/assets/sprites/GandalfHardcore Character Asset Pack/GandalfHardcore Character Asset Pack/Female Hand/Female Sword.png';

function randomX() {
  return Math.random() * 90 + '%';
}

function randomDuration() {
  return 2 + Math.random() * 2;
}

function randomRotate() {
  return Math.random() * 360;
}

export default function PetalSamurai() {
  const { unlockAchievement } = useAchievements();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [slices, setSlices] = useState<Slice[]>([]);
  const [samuraiX, setSamuraiX] = useState(50);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [lastPetalId, setLastPetalId] = useState(0);
  const [lastSliceId, setLastSliceId] = useState(0);

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const SAMURAI_SPEED = 2;
  const PETAL_SPAWN_RATE = 60; // frames between spawns

  // Petal image paths - use your new PNGs
  const PETAL_IMAGES = {
    cherry: '/assets/images/petal-cherry.png',
    sakura: '/assets/images/petal-sakura.png',
    golden: '/assets/images/petal-golden.png',
  };

  // Preload petal images on client
  const petalImageCache = useRef<{ [key in Petal['type']]: HTMLImageElement | null }>({
    cherry: null,
    sakura: null,
    golden: null,
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    (['cherry', 'sakura', 'golden'] as Petal['type'][]).forEach(type => {
      const img = new window.Image();
      img.src = PETAL_IMAGES[type];
      petalImageCache.current[type] = img;
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (!isGameActive) return;

    let frameCount = 0;
    const gameLoop = () => {
      frameCount++;

      // Spawn petals
      if (frameCount % PETAL_SPAWN_RATE === 0) {
        spawnPetal();
      }

      // Update petal positions
      setPetals(prev =>
        prev
          .map(petal => ({
            ...petal,
            y: petal.y - petal.speed,
            rotation: petal.rotation + 2,
          }))
          .filter(petal => petal.y > -50)
      );

      // Update slice effects
      setSlices(prev => prev.filter(slice => Date.now() - slice.timestamp < 500));

      // Update samurai position
      setSamuraiX(prev => {
        const targetX = 50 + Math.sin(Date.now() * 0.001) * 20;
        return prev + (targetX - prev) * 0.1;
      });

      // Update game time
      setGameTime(prev => prev + 1);

      requestAnimationFrame(gameLoop);
    };

    const interval = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(interval);
  }, [isGameActive]);

  const spawnPetal = useCallback(() => {
    const types: Petal['type'][] = ['cherry', 'sakura', 'golden'];
    const newPetal: Petal = {
      id: lastPetalId + 1,
      x: Math.random() * (GAME_WIDTH - 100) + 50,
      y: GAME_HEIGHT + 50,
      speed: 1 + Math.random() * 2,
      rotation: 0,
      sliced: false,
      type: types[Math.floor(Math.random() * types.length)],
    };
    setLastPetalId(prev => prev + 1);
    setPetals(prev => [...prev, newPetal]);
  }, [lastPetalId]);

  const handleSlice = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isGameActive) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create slice effect
      const newSlice: Slice = {
        id: lastSliceId + 1,
        x,
        y,
        angle: Math.atan2(y - GAME_HEIGHT / 2, x - GAME_WIDTH / 2),
        timestamp: Date.now(),
      };
      setLastSliceId(prev => prev + 1);
      setSlices(prev => [...prev, newSlice]);

      // Check for petal hits
      setPetals(prev =>
        prev.map(petal => {
          const distance = Math.sqrt((x - petal.x) ** 2 + (y - petal.y) ** 2);
          if (distance < 30 && !petal.sliced) {
            // Petal hit!
            const points = petal.type === 'golden' ? 50 : petal.type === 'sakura' ? 20 : 10;
            setScore(s => s + points);
            setCombo(c => c + 1);

            // Achievement unlocks
            if (combo + 1 >= 10) unlockAchievement('petal_samurai_combo');
            if (score + points >= 1000) unlockAchievement('petal_samurai_master');
            if (petal.type === 'golden') unlockAchievement('petal_samurai_golden');

            return { ...petal, sliced: true };
          }
          return petal;
        })
      );
    },
    [isGameActive, lastSliceId, combo, score, unlockAchievement]
  );

  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    setCombo(0);
    setGameTime(0);
    setPetals([]);
    setSlices([]);
  };

  const stopGame = () => {
    setIsGameActive(false);
    if (score > 500) unlockAchievement('petal_samurai_warrior');
  };

  // Draw game
  useEffect(() => {
    if (typeof window === 'undefined') return; // Only run on client
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw cherry blossoms in background
    ctx.fillStyle = 'rgba(255, 182, 193, 0.1)';
    for (let i = 0; i < 20; i++) {
      const x = (i * 40) % GAME_WIDTH;
      const y = (Date.now() * 0.1 + i * 30) % GAME_HEIGHT;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw samurai (simplified)
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(samuraiX - 10, GAME_HEIGHT - 80, 20, 60);
    ctx.fillStyle = '#000';
    ctx.fillRect(samuraiX - 5, GAME_HEIGHT - 90, 10, 20);

    // Draw petals using images
    petals.forEach(petal => {
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate((petal.rotation * Math.PI) / 180);
      const img = petalImageCache.current[petal.type];
      if (petal.sliced) {
        ctx.globalAlpha = 0.5;
      }
      if (img && img.complete) {
        ctx.drawImage(img, -15, -8, 30, 16);
      }
      ctx.restore();
    });

    // Draw slice effects
    slices.forEach(slice => {
      const alpha = 1 - (Date.now() - slice.timestamp) / 500;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(slice.x - 20, slice.y - 20);
      ctx.lineTo(slice.x + 20, slice.y + 20);
      ctx.stroke();
    });

    // Draw UI
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 20, 40);
    ctx.fillText(`Combo: ${combo}`, 20, 70);
    ctx.fillText(`Time: ${Math.floor(gameTime / 60)}s`, 20, 100);
  }, [petals, slices, samuraiX, score, combo, gameTime]);

  return (
    <div
      style={{
        background: '#181818',
        minHeight: '100vh',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* GameCube-style header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
          borderRadius: '12px',
          padding: '16px 24px',
          marginBottom: '24px',
          border: '2px solid #F59E0B',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: '#F59E0B',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#000',
            }}
          >
            GC
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Petal Samurai</h1>
          <div
            style={{
              fontSize: '12px',
              color: '#F59E0B',
              fontFamily: 'monospace',
            }}
          >
            GAME CUBE
          </div>
        </div>
      </div>

      <p style={{ fontSize: 18, marginBottom: 32, textAlign: 'center' }}>
        Slice falling petals with calm precision. Build combos for higher scores!
      </p>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          style={{
            border: '3px solid #8B5CF6',
            borderRadius: '12px',
            cursor: 'crosshair',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
          }}
          onMouseMove={handleSlice}
        />

        {!isGameActive && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.9)',
              padding: '24px',
              borderRadius: '12px',
              border: '2px solid #8B5CF6',
            }}
          >
            <p style={{ marginBottom: '16px', fontSize: '18px' }}>Click to slice petals!</p>
            <button
              onClick={startGame}
              style={{
                fontSize: '18px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              }}
            >
              Start Game
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <button
          onClick={isGameActive ? stopGame : startGame}
          style={{
            fontSize: 16,
            padding: '10px 20px',
            background: isGameActive ? '#EF4444' : '#10B981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {isGameActive ? 'Stop Game' : 'Start Game'}
        </button>

        <button
          onClick={() => window.history.back()}
          style={{
            fontSize: 16,
            padding: '10px 20px',
            background: '#6B7280',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Back to Menu
        </button>
      </div>

      <div style={{ fontSize: 14, textAlign: 'center', maxWidth: '600px' }}>
        <p>
          <strong>How to play:</strong>
        </p>
        <p>• Move your mouse to slice falling petals</p>
        <p>• Cherry petals: 10 points | Sakura petals: 20 points | Golden petals: 50 points</p>
        <p>• Build combos for bonus achievements!</p>
      </div>
    </div>
  );
}
