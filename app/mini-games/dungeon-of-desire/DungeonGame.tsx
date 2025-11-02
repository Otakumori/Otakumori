/**
 * Dungeon of Desire - 64-bit Side-Scroller
 * Premium pixel-art aesthetic with succubus enemies
 * Inspired by Castlevania: Symphony of the Night
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameSave } from '../_shared/SaveSystem';
import { motion, AnimatePresence } from 'framer-motion';

interface Enemy {
  id: number;
  x: number;
  y: number;
  type: 'succubus' | 'demon_lord';
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  animationFrame: number;
  direction: 'left' | 'right';
  attackCooldown: number;
}

interface Spell {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  lifetime: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

export default function DungeonGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const keysRef = useRef<Set<string>>(new Set());

  // Game state
  const [gameState, setGameState] = useState<
    'menu' | 'playing' | 'paused' | 'gameOver' | 'victory'
  >('menu');
  const [floor, setFloor] = useState(1);
  const [score, setScore] = useState(0);

  // Player state
  const [player, setPlayer] = useState({
    x: 100,
    y: 400,
    vx: 0,
    vy: 0,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    invulnerable: 0,
    onGround: true,
    facing: 'right' as 'left' | 'right',
    animationFrame: 0,
  });

  // Camera state (side-scrolling)
  const [camera, setCamera] = useState({ x: 0, y: 0 });

  // Game objects
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [spells, setSpells] = useState<Spell[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Game timing
  const [gameTime, setGameTime] = useState(0);
  const [, setEnemySpawnTimer] = useState(0);
  const [nextEnemyId, setNextEnemyId] = useState(1);
  const [nextParticleId, setNextParticleId] = useState(1);

  const { saveOnExit, autoSave } = useGameSave('dungeon-of-desire');

  useEffect(() => {
    void autoSave({
      score,
      level: floor,
      stats: {
        health: player.health,
        mana: player.mana,
      },
    });
  }, [autoSave, floor, player.health, player.mana, score]);

  useEffect(() => {
    return () => {
      void saveOnExit({
        score,
        level: floor,
        stats: {
          health: player.health,
          mana: player.mana,
        },
      });
    };
  }, [floor, player.health, player.mana, saveOnExit, score]);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const WORLD_WIDTH = 3200; // 4x canvas width for side-scrolling
  const GROUND_Y = 500;
  const PLAYER_SPEED = 5;
  const JUMP_FORCE = -12;
  const GRAVITY = 0.6;
  const SPELL_SPEED = 10;
  const SPELL_COST = 15;

  // Initialize game
  const startGame = useCallback(() => {
    setGameState('playing');
    setFloor(1);
    setScore(0);
    setGameTime(0);
    setPlayer({
      x: 100,
      y: GROUND_Y - 60,
      vx: 0,
      vy: 0,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      invulnerable: 0,
      onGround: true,
      facing: 'right',
      animationFrame: 0,
    });
    setCamera({ x: 0, y: 0 });
    setEnemies([]);
    setSpells([]);
    setParticles([]);
    setNextEnemyId(1);
  }, []);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());

      if (e.key === 'Escape') {
        setGameState((prev) =>
          prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev,
        );
      }

      if (
        (e.key === ' ' || e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') &&
        gameState === 'playing'
      ) {
        jump();
      }

      if ((e.key.toLowerCase() === 'f' || e.key === 'Enter') && gameState === 'playing') {
        castSpell();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Jump action
  const jump = useCallback(() => {
    setPlayer((prev) => {
      if (prev.onGround) {
        return { ...prev, vy: JUMP_FORCE, onGround: false };
      }
      return prev;
    });
  }, []);

  // Spell casting
  const castSpell = useCallback(() => {
    setPlayer((prev) => {
      if (prev.mana < SPELL_COST) return prev;

      const spellDirection = prev.facing === 'right' ? 1 : -1;
      const newSpell: Spell = {
        id: Date.now(),
        x: prev.x + (prev.facing === 'right' ? 40 : -20),
        y: prev.y + 20,
        vx: SPELL_SPEED * spellDirection,
        vy: 0,
        damage: 30,
        lifetime: 1.0,
      };

      setSpells((s) => [...s, newSpell]);

      // Spawn spell particles
      for (let i = 0; i < 5; i++) {
        setParticles((p) => [
          ...p,
          {
            id: nextParticleId + i,
            x: newSpell.x,
            y: newSpell.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1.0,
            size: 3 + Math.random() * 3,
            color: '#9333ea',
          },
        ]);
      }
      setNextParticleId((id) => id + 10);

      return { ...prev, mana: prev.mana - SPELL_COST };
    });
  }, [nextParticleId]);

  // Enemy spawning
  const spawnEnemy = useCallback(
    (type: 'succubus' | 'demon_lord', spawnX: number) => {
      const configs = {
        succubus: { health: 80, speed: 2, damage: 15 },
        demon_lord: { health: 200, speed: 1.2, damage: 30 },
      };

      const config = configs[type];
      const newEnemy: Enemy = {
        id: nextEnemyId,
        x: spawnX,
        y: GROUND_Y - (type === 'demon_lord' ? 100 : 70),
        type,
        health: config.health,
        maxHealth: config.health,
        speed: config.speed,
        damage: config.damage,
        animationFrame: 0,
        direction: spawnX > player.x ? 'left' : 'right',
        attackCooldown: 0,
      };

      setEnemies((prev) => [...prev, newEnemy]);
      setNextEnemyId((id) => id + 1);
    },
    [nextEnemyId, player.x],
  );

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      const deltaTime = 16; // ~60fps
      setGameTime((prev) => prev + deltaTime);

      // Player physics
      setPlayer((prev) => {
        let newX = prev.x;
        let newY = prev.y + prev.vy;
        let newVY = prev.vy;
        let newOnGround = prev.onGround;
        let newFacing = prev.facing;
        let newAnimationFrame = prev.animationFrame;

        // Horizontal movement
        if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) {
          newX = Math.max(20, prev.x - PLAYER_SPEED);
          newFacing = 'left';
          newAnimationFrame = (newAnimationFrame + 0.2) % 4;
        }
        if (keysRef.current.has('d') || keysRef.current.has('arrowright')) {
          newX = Math.min(WORLD_WIDTH - 60, prev.x + PLAYER_SPEED);
          newFacing = 'right';
          newAnimationFrame = (newAnimationFrame + 0.2) % 4;
        }

        // Gravity
        if (!prev.onGround) {
          newVY += GRAVITY;
        }

        // Ground collision
        if (newY >= GROUND_Y - 60) {
          newY = GROUND_Y - 60;
          newVY = 0;
          newOnGround = true;
        } else {
          newOnGround = false;
        }

        // Mana regeneration
        const newMana = Math.min(prev.maxMana, prev.mana + 0.05);

        // Invulnerability timer
        const newInvulnerable = Math.max(0, prev.invulnerable - deltaTime);

        return {
          ...prev,
          x: newX,
          y: newY,
          vy: newVY,
          onGround: newOnGround,
          facing: newFacing,
          animationFrame: newAnimationFrame,
          mana: newMana,
          invulnerable: newInvulnerable,
        };
      });

      // Update camera (follow player with smooth scrolling)
      setCamera((prev) => {
        const targetX = Math.max(
          0,
          Math.min(WORLD_WIDTH - CANVAS_WIDTH, player.x - CANVAS_WIDTH / 2),
        );
        const newX = prev.x + (targetX - prev.x) * 0.1; // Smooth camera
        return { ...prev, x: newX };
      });

      // Enemy spawning
      setEnemySpawnTimer((prev) => {
        const spawnRate = 3000 - floor * 200; // Faster spawning each floor
        if (prev <= 0 && enemies.length < 5) {
          // Spawn ahead of player
          const spawnX = player.x + CANVAS_WIDTH / 2 + Math.random() * 200;
          if (Math.random() < 0.2) {
            spawnEnemy('demon_lord', spawnX);
          } else {
            spawnEnemy('succubus', spawnX);
          }
          return Math.max(2000, spawnRate);
        }
        return prev - deltaTime;
      });

      // Update enemies
      setEnemies((prevEnemies) => {
        return prevEnemies.map((enemy) => {
          let newX = enemy.x;
          let newDirection = enemy.direction;
          let newAnimationFrame = (enemy.animationFrame + 0.1) % 4;
          let newAttackCooldown = Math.max(0, enemy.attackCooldown - deltaTime);

          // Move towards player
          const distanceToPlayer = player.x - enemy.x;
          if (Math.abs(distanceToPlayer) > 50) {
            newDirection = distanceToPlayer > 0 ? 'right' : 'left';
            newX += enemy.speed * (newDirection === 'right' ? 1 : -1);
          } else {
            // Attack player if close enough
            if (newAttackCooldown <= 0 && player.invulnerable <= 0) {
              const hit = Math.abs(player.x - enemy.x) < 60 && Math.abs(player.y - enemy.y) < 60;

              if (hit) {
                setPlayer((p) => ({
                  ...p,
                  health: Math.max(0, p.health - enemy.damage),
                  invulnerable: 1000,
                }));
                newAttackCooldown = 1500;
              }
            }
          }

          return {
            ...enemy,
            x: newX,
            direction: newDirection,
            animationFrame: newAnimationFrame,
            attackCooldown: newAttackCooldown,
          };
        });
      });

      // Update spells
      setSpells((prevSpells) => {
        return prevSpells
          .map((spell) => ({
            ...spell,
            x: spell.x + spell.vx,
            lifetime: spell.lifetime - 0.016,
          }))
          .filter((spell) => spell.lifetime > 0 && spell.x > -50 && spell.x < WORLD_WIDTH + 50);
      });

      // Update particles
      setParticles((prevParticles) => {
        return prevParticles
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 0.02,
          }))
          .filter((particle) => particle.life > 0);
      });

      // Spell vs Enemy collision
      setSpells((prevSpells) => {
        const remainingSpells: Spell[] = [];
        const hitEnemyIds = new Set<number>();

        prevSpells.forEach((spell) => {
          let spellHit = false;

          setEnemies((prevEnemies) => {
            return prevEnemies.map((enemy) => {
              if (hitEnemyIds.has(enemy.id)) return enemy;

              const hit =
                spell.x > enemy.x - 30 &&
                spell.x < enemy.x + 30 &&
                spell.y > enemy.y - 40 &&
                spell.y < enemy.y + 40;

              if (hit) {
                spellHit = true;
                hitEnemyIds.add(enemy.id);

                // Spawn hit particles
                for (let i = 0; i < 8; i++) {
                  const angle = (i / 8) * Math.PI * 2;
                  const speed = 2 + Math.random() * 3;
                  setParticles((p) => [
                    ...p,
                    {
                      id: nextParticleId + i,
                      x: enemy.x,
                      y: enemy.y,
                      vx: Math.cos(angle) * speed,
                      vy: Math.sin(angle) * speed,
                      life: 1.0,
                      size: 4 + Math.random() * 4,
                      color: '#ef4444',
                    },
                  ]);
                }
                setNextParticleId((id) => id + 10);

                const newHealth = enemy.health - spell.damage;
                if (newHealth <= 0) {
                  setScore((s) => s + (enemy.type === 'demon_lord' ? 500 : 100));
                  return { ...enemy, health: 0 }; // Will be filtered out
                }
                return { ...enemy, health: newHealth };
              }
              return enemy;
            });
          });

          if (!spellHit) {
            remainingSpells.push(spell);
          }
        });

        return remainingSpells;
      });

      // Remove dead enemies
      setEnemies((prev) => prev.filter((enemy) => enemy.health > 0));

      // Check game over
      if (player.health <= 0) {
        setGameState('gameOver');
      }

      // Floor progression (every 30 seconds)
      if (gameTime > 0 && Math.floor(gameTime / 30000) > floor - 1) {
        setFloor((f) => f + 1);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, player, enemies, floor, gameTime, spawnEnemy, nextParticleId]);

  // Rendering
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw dungeon background (parallax layers)
      drawDungeonBackground(ctx, camera.x);

      // Transform context for camera
      ctx.save();
      ctx.translate(-camera.x, -camera.y);

      // Draw ground
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, GROUND_Y, WORLD_WIDTH, CANVAS_HEIGHT - GROUND_Y);

      // Ground detail
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      for (let i = 0; i < WORLD_WIDTH / 100; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 100, GROUND_Y);
        ctx.lineTo(i * 100, CANVAS_HEIGHT);
        ctx.stroke();
      }

      // Draw enemies
      enemies.forEach((enemy) => {
        if (enemy.type === 'succubus') {
          drawSuccubus(ctx, enemy);
        } else {
          drawDemonLord(ctx, enemy);
        }
      });

      // Draw player
      drawPlayer(ctx, player);

      // Draw spells
      spells.forEach((spell) => {
        ctx.save();
        ctx.globalAlpha = spell.lifetime;
        ctx.fillStyle = '#a855f7';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#9333ea';
        ctx.beginPath();
        ctx.arc(spell.x, spell.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw particles
      particles.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();

      // UI Overlay (HUD)
      drawHUD(ctx);

      requestAnimationFrame(render);
    };

    render();
  }, [player, enemies, spells, particles, camera, floor, score]);

  // Background rendering
  const drawDungeonBackground = (ctx: CanvasRenderingContext2D, cameraX: number) => {
    // Layer 1: Deep background (slowest parallax)
    const bg1Gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bg1Gradient.addColorStop(0, '#0f0618');
    bg1Gradient.addColorStop(1, '#1a0b2e');
    ctx.fillStyle = bg1Gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Layer 2: Distant pillars (0.2x parallax)
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#2d1b3d';
    const pillarOffset = (cameraX * 0.2) % 200;
    for (let i = -1; i < CANVAS_WIDTH / 200 + 2; i++) {
      const x = i * 200 - pillarOffset;
      ctx.fillRect(x, 100, 30, 400);
    }
    ctx.restore();

    // Layer 3: Torches (0.5x parallax)
    ctx.save();
    const torchOffset = (cameraX * 0.5) % 300;
    for (let i = -1; i < CANVAS_WIDTH / 300 + 2; i++) {
      const x = i * 300 - torchOffset;
      // Torch fire (animated)
      const flicker = Math.sin(Date.now() / 100 + i) * 5;
      const fireGradient = ctx.createRadialGradient(
        x + 15,
        150 + flicker,
        0,
        x + 15,
        150 + flicker,
        20,
      );
      fireGradient.addColorStop(0, '#ff6b35');
      fireGradient.addColorStop(0.5, '#f7931e');
      fireGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = fireGradient;
      ctx.beginPath();
      ctx.arc(x + 15, 150 + flicker, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  // Player rendering (premium 64-bit sprite)
  const drawPlayer = (ctx: CanvasRenderingContext2D, p: typeof player) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.facing === 'left') ctx.scale(-1, 1);

    // Invulnerability flash
    if (p.invulnerable > 0 && Math.floor(p.invulnerable / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Body (adventurer in armor)
    const bodyGradient = ctx.createLinearGradient(-15, 0, 15, 60);
    bodyGradient.addColorStop(0, '#4a5568');
    bodyGradient.addColorStop(0.5, '#2d3748');
    bodyGradient.addColorStop(1, '#1a202c');
    ctx.fillStyle = bodyGradient;
    ctx.fillRect(-15, 15, 30, 45);

    // Shoulder plates
    ctx.fillStyle = '#cbd5e0';
    ctx.beginPath();
    ctx.ellipse(-18, 18, 8, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(18, 18, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
    headGradient.addColorStop(0, '#ffd4a3');
    headGradient.addColorStop(1, '#d4a574');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    // Helmet
    ctx.fillStyle = '#8b7355';
    ctx.beginPath();
    ctx.ellipse(0, -5, 16, 12, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -2, 5, 3);
    ctx.fillRect(3, -2, 5, 3);
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(-7, -1, 3, 2);
    ctx.fillRect(4, -1, 3, 2);

    // Legs (walking animation)
    const legOffset = Math.floor(p.animationFrame) % 2 === 0 ? 5 : -5;
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(-12, 60, 10, 20 + (legOffset > 0 ? legOffset : 0));
    ctx.fillRect(2, 60, 10, 20 + (legOffset < 0 ? -legOffset : 0));

    ctx.restore();
  };

  // Succubus rendering (premium detailed sprite)
  const drawSuccubus = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    if (enemy.direction === 'left') ctx.scale(-1, 1);

    // Body (curvy silhouette)
    const bodyGradient = ctx.createLinearGradient(-20, 0, 20, 70);
    bodyGradient.addColorStop(0, '#ec4899');
    bodyGradient.addColorStop(0.3, '#db2777');
    bodyGradient.addColorStop(1, '#9f1239');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(0, 30, 22, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings (bat-like)
    ctx.fillStyle = 'rgba(139, 0, 139, 0.6)';
    const wingAnimation = Math.sin(enemy.animationFrame * 2) * 10;
    ctx.beginPath();
    ctx.moveTo(-25, 20);
    ctx.quadraticCurveTo(-50, 10 + wingAnimation, -55, 30);
    ctx.quadraticCurveTo(-50, 50 - wingAnimation, -25, 40);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(25, 20);
    ctx.quadraticCurveTo(50, 10 + wingAnimation, 55, 30);
    ctx.quadraticCurveTo(50, 50 - wingAnimation, 25, 40);
    ctx.closePath();
    ctx.fill();

    // Head
    const headGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
    headGradient.addColorStop(0, '#ffc0cb');
    headGradient.addColorStop(1, '#ff69b4');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = '#4a0e0e';
    ctx.beginPath();
    ctx.moveTo(-12, -10);
    ctx.quadraticCurveTo(-18, -25, -15, -30);
    ctx.lineTo(-10, -25);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -10);
    ctx.quadraticCurveTo(18, -25, 15, -30);
    ctx.lineTo(10, -25);
    ctx.closePath();
    ctx.fill();

    // Eyes (alluring)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-6, -2, 5, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(6, -2, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9333ea';
    ctx.beginPath();
    ctx.arc(-6, -1, 3, 0, Math.PI * 2);
    ctx.arc(6, -1, 3, 0, Math.PI * 2);
    ctx.fill();
    // Shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-7, -3, 1.5, 0, Math.PI * 2);
    ctx.arc(5, -3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Lips
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(0, 6, 6, 3, 0, 0, Math.PI);
    ctx.fill();

    // Tail
    const tailAnimation = Math.sin(enemy.animationFrame * 3) * 15;
    ctx.strokeStyle = '#db2777';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(5, 65);
    ctx.quadraticCurveTo(15 + tailAnimation, 80, 20 + tailAnimation, 95);
    ctx.stroke();

    // Health bar
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-25, -35, 50, 5);
    const healthPercent = enemy.health / enemy.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#10b981' : healthPercent > 0.2 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(-25, -35, 50 * healthPercent, 5);

    ctx.restore();
  };

  // Demon Lord rendering (larger, more powerful)
  const drawDemonLord = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    if (enemy.direction === 'left') ctx.scale(-1, 1);

    // Larger, more imposing
    ctx.scale(1.5, 1.5);

    // Body
    const bodyGradient = ctx.createLinearGradient(-30, 0, 30, 80);
    bodyGradient.addColorStop(0, '#7c2d12');
    bodyGradient.addColorStop(0.5, '#991b1b');
    bodyGradient.addColorStop(1, '#450a0a');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(0, 40, 30, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Massive wings
    ctx.fillStyle = 'rgba(75, 0, 0, 0.8)';
    const wingAnimation = Math.sin(enemy.animationFrame * 2) * 15;
    ctx.beginPath();
    ctx.moveTo(-35, 25);
    ctx.quadraticCurveTo(-70, 15 + wingAnimation, -75, 40);
    ctx.quadraticCurveTo(-70, 65 - wingAnimation, -35, 55);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(35, 25);
    ctx.quadraticCurveTo(70, 15 + wingAnimation, 75, 40);
    ctx.quadraticCurveTo(70, 65 - wingAnimation, 35, 55);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    // Large horns
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-16, -12);
    ctx.quadraticCurveTo(-25, -40, -20, -45);
    ctx.lineTo(-14, -38);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(16, -12);
    ctx.quadraticCurveTo(25, -40, 20, -45);
    ctx.lineTo(14, -38);
    ctx.closePath();
    ctx.fill();

    // Glowing eyes
    ctx.fillStyle = '#facc15';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(-8, -3, 6, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(8, -3, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Health bar
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-35, -50, 70, 6);
    const healthPercent = enemy.health / enemy.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#10b981' : healthPercent > 0.2 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(-35, -50, 70 * healthPercent, 6);

    ctx.restore();
  };

  // HUD rendering
  const drawHUD = (ctx: CanvasRenderingContext2D) => {
    // Health bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(20, 20, 260, 30);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(25, 25, 250 * (player.health / player.maxHealth), 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(25, 25, 250, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`HP: ${Math.ceil(player.health)}/${player.maxHealth}`, 30, 40);

    // Mana bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(20, 60, 260, 25);
    ctx.fillStyle = '#9333ea';
    ctx.fillRect(25, 65, 250 * (player.mana / player.maxMana), 15);
    ctx.strokeRect(25, 65, 250, 15);
    ctx.fillText(`MP: ${Math.ceil(player.mana)}/${player.maxMana}`, 30, 77);

    // Floor and score
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(CANVAS_WIDTH - 220, 20, 200, 50);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`Floor: ${floor}`, CANVAS_WIDTH - 210, 40);
    ctx.fillText(`Score: ${score}`, CANVAS_WIDTH - 210, 62);

    // Controls hint
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(20, CANVAS_HEIGHT - 60, 300, 40);
    ctx.fillStyle = '#cbd5e0';
    ctx.font = '12px monospace';
    ctx.fillText('Move: A/D  Jump: W/Space  Cast: F/Enter', 25, CANVAS_HEIGHT - 35);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-purple-900 via-gray-900 to-black">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded-2xl border-2 border-purple-500/30 shadow-2xl"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Menu Screen */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl"
          >
            <div className="text-center">
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">
                Dungeon of Desire
              </h1>
              <p className="text-pink-200 mb-8 text-lg">64-bit Side-Scroller</p>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Enter the Dungeon
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Screen */}
      <AnimatePresence>
        {gameState === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl"
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold text-purple-300 mb-6">Paused</h2>
              <p className="text-pink-200 text-lg">Press ESC to continue</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState === 'gameOver' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-2xl"
          >
            <div className="text-center bg-gradient-to-b from-gray-900 to-black p-12 rounded-3xl border-2 border-red-500/50">
              <h2 className="text-5xl font-bold text-red-500 mb-4">Defeated</h2>
              <p className="text-pink-200 mb-2 text-xl">Floor: {floor}</p>
              <p className="text-purple-300 mb-8 text-2xl">Score: {score}</p>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
