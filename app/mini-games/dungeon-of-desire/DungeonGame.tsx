/**
 * Dungeon of Desire - 64-bit Side-Scroller
 * Premium pixel-art aesthetic with succubus enemies
 * Inspired by Castlevania: Symphony of the Night
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameSave } from '../_shared/SaveSystem';
import { motion, AnimatePresence } from 'framer-motion';
import { PhysicsCharacterRenderer } from '../_shared/PhysicsCharacterRenderer';
import { createGlowEffect } from '../_shared/enhancedTextures';

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
  telegraphTime: number; // Time remaining in telegraph state
  state: 'idle' | 'telegraph' | 'attacking';

interface Spell {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  lifetime: number;

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;

export default function DungeonGame({
  onScoreChange,
  onHealthChange,
  onFloorChange,
  onGameEnd,
}: {
  onScoreChange?: (score: number) => void;
  onHealthChange?: (health: number) => void;
  onFloorChange?: (floor: number) => void;
  onGameEnd?: (score: number, didWin: boolean) => void;
} = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const keysRef = useRef<Set<string>>(new Set());

  // Physics renderers for enemies (Map<enemyId, PhysicsCharacterRenderer>)
  const enemyRenderersRef = useRef<Map<number, PhysicsCharacterRenderer>>(new Map());

  // Game state
  const [gameState, setGameState] = useState<
    'menu' | 'playing' | 'paused' | 'gameOver' | 'victory'
  >('menu');
  const [floor, setFloor] = useState(1);
  const [score, setScore] = useState(0);
  const [roomEnemiesSpawned, setRoomEnemiesSpawned] = useState(false);

  // Notify parent of state changes
  // Player state (must be declared before useEffect hooks that use it)
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

  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(score);
    }
  }, [score, onScoreChange]);

  useEffect(() => {
    if (onHealthChange) {
      onHealthChange(player.health);
    }
  }, [player.health, onHealthChange]);

  useEffect(() => {
    if (onFloorChange) {
      onFloorChange(floor);
    }
  }, [floor, onFloorChange]);

  // Camera state (side-scrolling)
  const [camera, setCamera] = useState({ x: 0, y: 0 });

  // Game objects
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [spells, setSpells] = useState<Spell[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Game timing
  const [gameTime, setGameTime] = useState(0);
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
    setRoomEnemiesSpawned(false);

    // Cleanup physics renderers
    enemyRenderersRef.current.forEach((renderer) => renderer.dispose());
    enemyRenderersRef.current.clear();
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
        telegraphTime: 0,
        state: 'idle',
      };

      // Create physics renderer for new enemy
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const renderer = new PhysicsCharacterRenderer(
            ctx,
            type === 'succubus' ? 'succubus' : 'demon_lord',
            { quality: 'high', enabled: true },
          );
          enemyRenderersRef.current.set(newEnemy.id, renderer);
        }
      }

      setEnemies((prev) => [...prev, newEnemy]);
      setNextEnemyId((id) => id + 1);
    },
    [nextEnemyId, player.x],
  );

  // Generate room layout based on floor
  const generateRoomLayout = useCallback(
    (floorNum: number, enemyCount: number): Array<'succubus' | 'demon_lord'> => {
      const layout: Array<'succubus' | 'demon_lord'> = [];

      // Boss room every 5 floors
      if (floorNum % 5 === 0 && enemyCount > 0) {
        layout.push('demon_lord');
        enemyCount--;
      }

      // Mix of enemies based on floor
      for (let i = 0; i < enemyCount; i++) {
        const demonLordChance = Math.min(0.1 + floorNum * 0.05, 0.4); // More demon lords as floors increase
        if (Math.random() < demonLordChance) {
          layout.push('demon_lord');
        } else {
          layout.push('succubus');
        }
      }

      return layout;
    },
    [],
  );

  // Game loop (moved after generateRoomLayout)
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

      // Room-based enemy spawning
      if (!roomEnemiesSpawned && enemies.length === 0) {
        // Generate room layout based on floor
        const roomEnemyCount = Math.min(2 + floor, 6); // More enemies per floor
        const roomLayout = generateRoomLayout(floor, roomEnemyCount);

        // Spawn enemies for this room
        roomLayout.forEach((enemyType, index) => {
          setTimeout(() => {
            const spawnX = player.x + CANVAS_WIDTH / 2 + index * 150 + Math.random() * 100;
            spawnEnemy(enemyType, spawnX);
          }, index * 200);
        });

        setRoomEnemiesSpawned(true);
      }

      // Check if room is cleared (all enemies defeated)
      if (roomEnemiesSpawned && enemies.length === 0 && gameState === 'playing') {
        // Room cleared! Check if we should advance floor
        const roomsPerFloor = 3 + Math.floor(floor / 2); // More rooms per floor as you go deeper
        const currentRoomIndex = Math.floor(gameTime / 1000 / 30); // Approximate room index

        if (currentRoomIndex >= roomsPerFloor - 1) {
          // Floor cleared! Advance to next floor
          setFloor((f) => {
            const newFloor = f + 1;
            // Award petals for floor completion
            if (onFloorChange) {
              onFloorChange(newFloor);
            }
            // Award score bonus for floor completion
            setScore((s) => s + newFloor * 500);
            return newFloor;
          });
        }
        setRoomEnemiesSpawned(false);
      }

      // Update enemies with telegraphs and physics
      setEnemies((prevEnemies) => {
        return prevEnemies.map((enemy) => {
          let newX = enemy.x;
          let newDirection = enemy.direction;
          let newAnimationFrame = (enemy.animationFrame + 0.1) % 4;
          let newAttackCooldown = Math.max(0, enemy.attackCooldown - deltaTime);
          let newTelegraphTime = Math.max(0, enemy.telegraphTime - deltaTime);
          let newState = enemy.state;

          // Update physics renderer (will be called after position update)
          // Store renderer reference for later update

          // Move towards player
          const distanceToPlayer = player.x - enemy.x;
          if (Math.abs(distanceToPlayer) > 50) {
            newDirection = distanceToPlayer > 0 ? 'right' : 'left';
            newX += enemy.speed * (newDirection === 'right' ? 1 : -1);
            newState = 'idle';
          } else {
            // Close enough to attack - use telegraph system
            if (enemy.state === 'telegraph') {
              // In telegraph state - countdown to attack
              if (newTelegraphTime <= 0) {
                // Execute attack
                newState = 'attacking';
                if (player.invulnerable <= 0) {
                  const hit =
                    Math.abs(player.x - enemy.x) < 60 && Math.abs(player.y - enemy.y) < 60;
                  if (hit) {
                    setPlayer((p) => ({
                      ...p,
                      health: Math.max(0, p.health - enemy.damage),
                      invulnerable: 1000,
                    }));
                  }
                }
                newAttackCooldown = enemy.type === 'demon_lord' ? 2000 : 1500;
                setTimeout(() => {
                  setEnemies((prev) =>
                    prev.map((e) => (e.id === enemy.id ? { ...e, state: 'idle' } : e)),
                  );
                }, 400);
              }
            } else if (enemy.state === 'attacking') {
              // Already attacking, wait for cooldown
              if (newAttackCooldown <= 0) {
                newState = 'idle';
              }
            } else if (newAttackCooldown <= 0) {
              // Start telegraph - warn player before attack
              newState = 'telegraph';
              newTelegraphTime = enemy.type === 'demon_lord' ? 1000 : 600; // Longer telegraph for demon lords
            }
          }

          const updatedEnemy = {
            ...enemy,
            x: newX,
            direction: newDirection,
            animationFrame: newAnimationFrame,
            attackCooldown: newAttackCooldown,
            telegraphTime: newTelegraphTime,
            state: newState,
          };

          // Update physics renderer after position is calculated
          const renderer = enemyRenderersRef.current.get(enemy.id);
          if (renderer) {
            const velocityX = (newX - enemy.x) / deltaTime;
            const velocityY = 0; // Enemies stay on ground
            renderer.update(deltaTime, { x: velocityX, y: velocityY }, { x: newX, y: enemy.y });
          }

          return updatedEnemy;
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

                // Apply physics impact
                const renderer = enemyRenderersRef.current.get(enemy.id);
                if (renderer) {
                  const impactForce = {
                    x: spell.vx > 0 ? 3 : -3,
                    y: -2,
                  };
                  renderer.applyImpact(impactForce, 'chest');
                }

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
                  // Cleanup physics renderer
                  const renderer = enemyRenderersRef.current.get(enemy.id);
                  if (renderer) {
                    renderer.dispose();
                    enemyRenderersRef.current.delete(enemy.id);
                  }
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

      // Remove dead enemies and cleanup physics renderers
      setEnemies((prev) => {
        const alive = prev.filter((enemy) => enemy.health > 0);
        // Cleanup renderers for dead enemies
        prev.forEach((enemy) => {
          if (enemy.health <= 0) {
            const renderer = enemyRenderersRef.current.get(enemy.id);
            if (renderer) {
              renderer.dispose();
              enemyRenderersRef.current.delete(enemy.id);
            }
          }
        });
        return alive;
      });

      // Check game over
      if (player.health <= 0) {
        setGameState('gameOver');
        // Notify parent of game over
        if (onGameEnd) {
          onGameEnd(score, false); // didWin = false (health reached 0)
        }
      }

      // Floor progression is now room-based (handled above)

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    gameState,
    player,
    enemies,
    floor,
    gameTime,
    spawnEnemy,
    nextParticleId,
    roomEnemiesSpawned,
    onFloorChange,
    generateRoomLayout,
  ]);

  // Rendering
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw dungeon background (parallax layers) - Enhanced
      drawDungeonBackground(ctx, camera.x);

      // Enhanced background gradient overlay
      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

      // Draw enemies with physics
      enemies.forEach((enemy) => {
        const renderer = enemyRenderersRef.current.get(enemy.id);
        if (renderer) {
          // Use physics renderer
          renderer.render(enemy.x, enemy.y, enemy.direction);

          // Draw health bar (still needed)
          ctx.save();
          ctx.translate(enemy.x, enemy.y);
          if (enemy.direction === 'left') ctx.scale(-1, 1);
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(-25, -35, 50, 5);
          const healthPercent = enemy.health / enemy.maxHealth;
          ctx.fillStyle =
            healthPercent > 0.5 ? '#10b981' : healthPercent > 0.2 ? '#f59e0b' : '#ef4444';
          ctx.fillRect(-25, -35, 50 * healthPercent, 5);

          // Telegraph warning
          if (enemy.state === 'telegraph') {
            const telegraphProgress =
              1 - enemy.telegraphTime / (enemy.type === 'demon_lord' ? 1000 : 600);
            const pulse = Math.sin(telegraphProgress * Math.PI * 4) * 0.3 + 0.7;
            ctx.save();
            ctx.globalAlpha = pulse;
            ctx.strokeStyle = enemy.type === 'demon_lord' ? '#ff4444' : '#ffaa44';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = enemy.type === 'demon_lord' ? '#ff4444' : '#ffaa44';
            ctx.beginPath();
            ctx.arc(0, 0, 35, 0, Math.PI * 2);
            ctx.stroke();
            if (enemy.type === 'demon_lord') {
              ctx.fillStyle = '#ff4444';
              ctx.font = 'bold 20px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('!', 0, 5);
            }
            ctx.restore();
          }
          ctx.restore();
        } else {
          // Fallback to original rendering if physics not ready
          if (enemy.type === 'succubus') {
            drawSuccubus(ctx, enemy);
          } else {
            drawDemonLord(ctx, enemy);
          }
        }
      });

      // Draw player
      drawPlayer(ctx, player);

      // Draw spells - Enhanced with better gradients, glow, and bloom
      spells.forEach((spell) => {
        ctx.save();
        ctx.globalAlpha = spell.lifetime;

        // Bloom effect
        createGlowEffect(ctx, spell.x, spell.y, 15, '#9333ea', 0.4);

        // Outer glow
        const spellGradient = ctx.createRadialGradient(spell.x, spell.y, 0, spell.x, spell.y, 12);
        spellGradient.addColorStop(0, '#c084fc');
        spellGradient.addColorStop(0.5, '#a855f7');
        spellGradient.addColorStop(1, '#9333ea');
        ctx.fillStyle = spellGradient;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#9333ea';
        ctx.beginPath();
        ctx.arc(spell.x, spell.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#c084fc';
        ctx.beginPath();
        ctx.arc(spell.x, spell.y, 5, 0, Math.PI * 2);
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

    // Body (curvy silhouette) - Enhanced with multiple gradients and highlights
    const bodyGradient = ctx.createLinearGradient(-20, 0, 20, 70);
    bodyGradient.addColorStop(0, '#ec4899');
    bodyGradient.addColorStop(0.3, '#db2777');
    bodyGradient.addColorStop(0.6, '#be185d');
    bodyGradient.addColorStop(1, '#9f1239');
    ctx.fillStyle = bodyGradient;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(236, 72, 153, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 22, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Body highlight for depth
    const highlightGradient = ctx.createRadialGradient(-8, 20, 0, -8, 20, 15);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    highlightGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.ellipse(-8, 20, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings (bat-like) - Enhanced with membrane detail and shadows
    const wingAnimation = Math.sin(enemy.animationFrame * 2) * 10;

    // Left wing shadow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(-25, 22);
    ctx.quadraticCurveTo(-50, 12 + wingAnimation, -55, 32);
    ctx.quadraticCurveTo(-50, 52 - wingAnimation, -25, 42);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Left wing with gradient
    const leftWingGradient = ctx.createLinearGradient(-25, 20, -55, 30);
    leftWingGradient.addColorStop(0, 'rgba(139, 0, 139, 0.8)');
    leftWingGradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.7)');
    leftWingGradient.addColorStop(1, 'rgba(25, 25, 112, 0.6)');
    ctx.fillStyle = leftWingGradient;
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(139, 0, 139, 0.5)';
    ctx.beginPath();
    ctx.moveTo(-25, 20);
    ctx.quadraticCurveTo(-50, 10 + wingAnimation, -55, 30);
    ctx.quadraticCurveTo(-50, 50 - wingAnimation, -25, 40);
    ctx.closePath();
    ctx.fill();

    // Wing membrane detail
    ctx.strokeStyle = 'rgba(200, 0, 200, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-30, 25);
    ctx.quadraticCurveTo(-45, 20 + wingAnimation, -50, 30);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Right wing shadow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(25, 22);
    ctx.quadraticCurveTo(50, 12 + wingAnimation, 55, 32);
    ctx.quadraticCurveTo(50, 52 - wingAnimation, 25, 42);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Right wing with gradient
    const rightWingGradient = ctx.createLinearGradient(25, 20, 55, 30);
    rightWingGradient.addColorStop(0, 'rgba(139, 0, 139, 0.8)');
    rightWingGradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.7)');
    rightWingGradient.addColorStop(1, 'rgba(25, 25, 112, 0.6)');
    ctx.fillStyle = rightWingGradient;
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(139, 0, 139, 0.5)';
    ctx.beginPath();
    ctx.moveTo(25, 20);
    ctx.quadraticCurveTo(50, 10 + wingAnimation, 55, 30);
    ctx.quadraticCurveTo(50, 50 - wingAnimation, 25, 40);
    ctx.closePath();
    ctx.fill();

    // Wing membrane detail
    ctx.strokeStyle = 'rgba(200, 0, 200, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 25);
    ctx.quadraticCurveTo(45, 20 + wingAnimation, 50, 30);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Head - Enhanced with better gradients and shadows
    const headGradient = ctx.createRadialGradient(0, -5, 0, 0, 0, 18);
    headGradient.addColorStop(0, '#ffc0cb');
    headGradient.addColorStop(0.5, '#ff91b4');
    headGradient.addColorStop(1, '#ff69b4');
    ctx.fillStyle = headGradient;
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(255, 105, 180, 0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Head highlight
    const headHighlight = ctx.createRadialGradient(-5, -8, 0, -5, -8, 10);
    headHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    headHighlight.addColorStop(1, 'transparent');
    ctx.fillStyle = headHighlight;
    ctx.beginPath();
    ctx.arc(-5, -8, 8, 0, Math.PI * 2);
    ctx.fill();

    // Horns - Enhanced with gradients and highlights
    const hornGradient = ctx.createLinearGradient(-12, -10, -15, -30);
    hornGradient.addColorStop(0, '#6b1f1f');
    hornGradient.addColorStop(0.5, '#4a0e0e');
    hornGradient.addColorStop(1, '#2d0505');
    ctx.fillStyle = hornGradient;
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(74, 14, 14, 0.6)';
    ctx.beginPath();
    ctx.moveTo(-12, -10);
    ctx.quadraticCurveTo(-18, -25, -15, -30);
    ctx.lineTo(-10, -25);
    ctx.closePath();
    ctx.fill();

    // Horn highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(-11, -12);
    ctx.quadraticCurveTo(-16, -24, -13, -28);
    ctx.lineTo(-10, -25);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = hornGradient;
    ctx.beginPath();
    ctx.moveTo(12, -10);
    ctx.quadraticCurveTo(18, -25, 15, -30);
    ctx.lineTo(10, -25);
    ctx.closePath();
    ctx.fill();

    // Horn highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(11, -12);
    ctx.quadraticCurveTo(16, -24, 13, -28);
    ctx.lineTo(10, -25);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

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

    // Telegraph warning - visual indicator before attack
    if (enemy.state === 'telegraph') {
      const telegraphProgress =
        1 - enemy.telegraphTime / (enemy.type === 'demon_lord' ? 1000 : 600);
      const pulse = Math.sin(telegraphProgress * Math.PI * 4) * 0.3 + 0.7;

      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = enemy.type === 'demon_lord' ? '#ff4444' : '#ffaa44';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = enemy.type === 'demon_lord' ? '#ff4444' : '#ffaa44';
      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.stroke();

      // Exclamation mark for demon lords
      if (enemy.type === 'demon_lord') {
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('!', 0, 5);
      }
      ctx.restore();
    }

    ctx.restore();
  };

  // Demon Lord rendering (larger, more powerful)
  const drawDemonLord = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    if (enemy.direction === 'left') ctx.scale(-1, 1);

    // Larger, more imposing
    ctx.scale(1.5, 1.5);

    // Body - Enhanced with better gradients and depth
    const bodyGradient = ctx.createLinearGradient(-30, 0, 30, 80);
    bodyGradient.addColorStop(0, '#7c2d12');
    bodyGradient.addColorStop(0.3, '#991b1b');
    bodyGradient.addColorStop(0.6, '#7f1d1d');
    bodyGradient.addColorStop(1, '#450a0a');
    ctx.fillStyle = bodyGradient;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(153, 27, 27, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 40, 30, 45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Body highlight for depth
    const demonHighlight = ctx.createRadialGradient(-10, 30, 0, -10, 30, 20);
    demonHighlight.addColorStop(0, 'rgba(255, 200, 200, 0.15)');
    demonHighlight.addColorStop(1, 'transparent');
    ctx.fillStyle = demonHighlight;
    ctx.beginPath();
    ctx.ellipse(-10, 30, 18, 25, 0, 0, Math.PI * 2);
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

    // Telegraph warning for demon lord
    if (enemy.state === 'telegraph') {
      const telegraphProgress = 1 - enemy.telegraphTime / 1000;
      const pulse = Math.sin(telegraphProgress * Math.PI * 4) * 0.3 + 0.7;

      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff4444';
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, 10);
      ctx.restore();
    }

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
