'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameSave } from '../_shared/SaveSystem';

interface Enemy {
  id: number;
  x: number;
  y: number;
  type: 'minion' | 'boss';
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
}

interface Pickup {
  id: number;
  x: number;
  y: number;
  type: 'health' | 'mana' | 'treasure';
  value: number;
}

interface Spell {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
}

export default function DungeonGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());

  // Game state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver' | 'victory'>('menu');
  const [stage, setStage] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  // Player state
  const [player, setPlayer] = useState({
    x: 100,
    y: 300,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    invulnerable: 0,
  });

  // Game objects
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [spells, setSpells] = useState<Spell[]>([]);

  // Game timing
  const [gameTime, setGameTime] = useState(0);
  const [enemySpawnTimer, setEnemySpawnTimer] = useState(0);
  const [pickupSpawnTimer, setPickupSpawnTimer] = useState(0);

  const { saveOnExit, autoSave } = useGameSave('dungeon-of-desire');

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PLAYER_SPEED = 4;
  const SPELL_SPEED = 8;
  const MAX_TIME = 3600; // 1 hour cap
  const STAGE_DURATION = 60000; // 60 seconds per stage

  // Initialize game
  const startGame = useCallback(() => {
    setGameState('playing');
    setStage(1);
    setScore(0);
    setLives(3);
    setGameTime(0);
    setPlayer({
      x: 100,
      y: 300,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      invulnerable: 0,
    });
    setEnemies([]);
    setPickups([]);
    setSpells([]);
    setEnemySpawnTimer(0);
    setPickupSpawnTimer(0);
  }, []);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      
      if (e.key === 'Escape') {
        setGameState(prev => prev === 'playing' ? 'paused' : prev);
      }
      
      if (e.key === ' ' && gameState === 'playing') {
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

  // Spell casting
  const castSpell = useCallback(() => {
    if (player.mana < 10) return;
    
    setPlayer(prev => ({ ...prev, mana: Math.max(0, prev.mana - 10) }));
    
    const newSpell: Spell = {
      id: Date.now(),
      x: player.x + 30,
      y: player.y + 15,
      vx: SPELL_SPEED,
      vy: 0,
      damage: 25,
    };
    
    setSpells(prev => [...prev, newSpell]);
  }, [player.mana, player.x, player.y]);

  // Enemy spawning
  const spawnEnemy = useCallback(() => {
    const enemyTypes = [
      { type: 'minion' as const, health: 50, speed: 1.5, damage: 15 },
      { type: 'boss' as const, health: 150, speed: 1, damage: 25 },
    ];
    
    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const bossChance = stage > 3 ? 0.2 : 0.1;
    const isBoss = Math.random() < bossChance;
    const template = isBoss ? enemyTypes[1] : enemyTypes[0];
    
    const newEnemy: Enemy = {
      id: Date.now(),
      x: CANVAS_WIDTH + 50,
      y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
      type: template.type,
      health: template.health + (stage - 1) * 10,
      maxHealth: template.health + (stage - 1) * 10,
      speed: template.speed + (stage - 1) * 0.2,
      damage: template.damage + (stage - 1) * 2,
    };
    
    setEnemies(prev => [...prev, newEnemy]);
  }, [stage]);

  // Pickup spawning
  const spawnPickup = useCallback(() => {
    const pickupTypes = [
      { type: 'health' as const, value: 30 },
      { type: 'mana' as const, value: 20 },
      { type: 'treasure' as const, value: 100 },
    ];
    
    const pickup = pickupTypes[Math.floor(Math.random() * pickupTypes.length)];
    
    const newPickup: Pickup = {
      id: Date.now(),
      x: CANVAS_WIDTH + 30,
      y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
      type: pickup.type,
      value: pickup.value,
    };
    
    setPickups(prev => [...prev, newPickup]);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const gameLoop = () => {
      const deltaTime = 16; // ~60fps
      setGameTime(prev => {
        const newTime = prev + deltaTime;
        
        // Check for stage progression
        if (newTime > stage * STAGE_DURATION) {
          setStage(s => s + 1);
        }
        
        // Time limit (1 hour cap)
        if (newTime > MAX_TIME * 1000) {
          setGameState('victory');
          return newTime;
        }
        
        return newTime;
      });

      // Player movement
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let newMana = Math.min(prev.maxMana, prev.mana + 0.1); // Slow mana regen
        let newInvulnerable = Math.max(0, prev.invulnerable - deltaTime);
        
        if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) {
          newX = Math.max(0, newX - PLAYER_SPEED);
        }
        if (keysRef.current.has('d') || keysRef.current.has('arrowright')) {
          newX = Math.min(CANVAS_WIDTH - 40, newX + PLAYER_SPEED);
        }
        if (keysRef.current.has('w') || keysRef.current.has('arrowup')) {
          newY = Math.max(0, newY - PLAYER_SPEED);
        }
        if (keysRef.current.has('s') || keysRef.current.has('arrowdown')) {
          newY = Math.min(CANVAS_HEIGHT - 40, newY + PLAYER_SPEED);
        }
        
        return {
          ...prev,
          x: newX,
          y: newY,
          mana: newMana,
          invulnerable: newInvulnerable,
        };
      });

      // Enemy spawning
      setEnemySpawnTimer(prev => {
        const spawnRate = Math.max(500, 2000 - stage * 100); // Faster spawning each stage
        if (prev <= 0) {
          spawnEnemy();
          return spawnRate;
        }
        return prev - deltaTime;
      });

      // Pickup spawning
      setPickupSpawnTimer(prev => {
        if (prev <= 0) {
          if (Math.random() < 0.3) spawnPickup();
          return 5000; // Every 5 seconds chance
        }
        return prev - deltaTime;
      });

      // Update spells
      setSpells(prev => prev
        .map(spell => ({ ...spell, x: spell.x + spell.vx, y: spell.y + spell.vy }))
        .filter(spell => spell.x < CANVAS_WIDTH + 50)
      );

      // Update enemies
      setEnemies(prev => prev
        .map(enemy => ({ ...enemy, x: enemy.x - enemy.speed }))
        .filter(enemy => enemy.x > -50 && enemy.health > 0)
      );

      // Update pickups
      setPickups(prev => prev
        .map(pickup => ({ ...pickup, x: pickup.x - 2 }))
        .filter(pickup => pickup.x > -30)
      );

      // Collision detection
      // Spells vs Enemies
      setSpells(prevSpells => {
        return prevSpells.filter(spell => {
          let hit = false;
          setEnemies(prevEnemies => 
            prevEnemies.map(enemy => {
              if (!hit && 
                  spell.x < enemy.x + 40 && spell.x + 10 > enemy.x &&
                  spell.y < enemy.y + 40 && spell.y + 5 > enemy.y) {
                hit = true;
                const newHealth = enemy.health - spell.damage;
                if (newHealth <= 0) {
                  setScore(prev => prev + (enemy.type === 'boss' ? 200 : 100));
                }
                return { ...enemy, health: newHealth };
              }
              return enemy;
            })
          );
          return !hit;
        });
      });

      // Player vs Enemies
      if (player.invulnerable <= 0) {
        setEnemies(prevEnemies => {
          let playerHit = false;
          const result = prevEnemies.filter(enemy => {
            const collision = enemy.x < player.x + 40 && enemy.x + 40 > player.x &&
                            enemy.y < player.y + 40 && enemy.y + 40 > player.y;
            if (collision && !playerHit) {
              playerHit = true;
              setPlayer(prev => {
                const newHealth = prev.health - enemy.damage;
                if (newHealth <= 0) {
                  setLives(l => l - 1);
                  return {
                    ...prev,
                    health: prev.maxHealth,
                    invulnerable: 2000, // 2 second invulnerability
                  };
                }
                return {
                  ...prev,
                  health: newHealth,
                  invulnerable: 1000, // 1 second invulnerability
                };
              });
              return false; // Remove enemy that hit player
            }
            return true;
          });
          return result;
        });
      }

      // Player vs Pickups
      setPickups(prevPickups => {
        return prevPickups.filter(pickup => {
          const collision = pickup.x < player.x + 40 && pickup.x + 20 > player.x &&
                          pickup.y < player.y + 40 && pickup.y + 20 > player.y;
          if (collision) {
            setPlayer(prev => {
              switch (pickup.type) {
                case 'health':
                  return { ...prev, health: Math.min(prev.maxHealth, prev.health + pickup.value) };
                case 'mana':
                  return { ...prev, mana: Math.min(prev.maxMana, prev.mana + pickup.value) };
                case 'treasure':
                  setScore(s => s + pickup.value);
                  return prev;
                default:
                  return prev;
              }
            });
            return false;
          }
          return true;
        });
      });

      // Check game over
      if (lives <= 0) {
        setGameState('gameOver');
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, stage, player, lives, spawnEnemy, spawnPickup]);

  // Auto-save progress
  useEffect(() => {
    if (gameState === 'playing' && score > 0 && score % 500 === 0) {
      autoSave({
        score,
        level: stage,
        progress: Math.min(1.0, gameTime / MAX_TIME),
        stats: { stage, lives, survivalTime: gameTime },
      }).catch(() => {}); // Ignore save errors during gameplay
    }
  }, [score, stage, gameTime, lives, autoSave, gameState]);

  // Save on game end
  useEffect(() => {
    if (gameState === 'gameOver' || gameState === 'victory') {
      saveOnExit({
        score,
        level: stage,
        progress: gameState === 'victory' ? 1.0 : gameTime / MAX_TIME,
        stats: {
          stage,
          finalLives: lives,
          survivalTime: gameTime,
          victory: gameState === 'victory',
          lastPlayed: Date.now(),
        },
      }).catch(console.error);
    }
  }, [gameState, score, stage, lives, gameTime, saveOnExit]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameState !== 'playing') return;

    // Draw background dungeon pattern
    ctx.fillStyle = '#1a1a2e';
    for (let x = 0; x < CANVAS_WIDTH; x += 60) {
      for (let y = 0; y < CANVAS_HEIGHT; y += 60) {
        if ((x + y) % 120 === 0) {
          ctx.fillRect(x, y, 30, 30);
        }
      }
    }

    // Draw player (succubus)
    ctx.fillStyle = player.invulnerable > 0 ? '#ff6b9d80' : '#ff6b9d';
    ctx.fillRect(player.x, player.y, 40, 40);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🎭', player.x + 12, player.y + 25);

    // Draw enemies
    enemies.forEach(enemy => {
      ctx.fillStyle = enemy.type === 'boss' ? '#8b0000' : '#4a4a4a';
      ctx.fillRect(enemy.x, enemy.y, 40, 40);
      
      // Health bar
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(enemy.x, enemy.y - 8, 40, 4);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(enemy.x, enemy.y - 8, (enemy.health / enemy.maxHealth) * 40, 4);
      
      // Enemy symbol
      ctx.fillStyle = '#ffffff';
      ctx.fillText(enemy.type === 'boss' ? '👹' : '👻', enemy.x + 12, enemy.y + 25);
    });

    // Draw spells
    spells.forEach(spell => {
      ctx.fillStyle = '#ff69b4';
      ctx.fillRect(spell.x, spell.y, 10, 5);
      ctx.shadowColor = '#ff69b4';
      ctx.shadowBlur = 10;
      ctx.fillRect(spell.x, spell.y, 10, 5);
      ctx.shadowBlur = 0;
    });

    // Draw pickups
    pickups.forEach(pickup => {
      const colors = {
        health: '#ff0000',
        mana: '#0066ff',
        treasure: '#ffd700',
      };
      ctx.fillStyle = colors[pickup.type];
      ctx.fillRect(pickup.x, pickup.y, 20, 20);
      
      const symbols = {
        health: '❤️',
        mana: '💙',
        treasure: '💰',
      };
      ctx.fillStyle = '#ffffff';
      ctx.fillText(symbols[pickup.type], pickup.x + 2, pickup.y + 15);
    });

    // Draw UI
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`Stage: ${stage}`, 10, 45);
    ctx.fillText(`Lives: ${lives}`, 10, 65);
    ctx.fillText(`Time: ${Math.floor(gameTime / 1000)}s`, 10, 85);

    // Health and mana bars
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(CANVAS_WIDTH - 200, 10, 190, 20);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(CANVAS_WIDTH - 200, 10, (player.health / player.maxHealth) * 190, 20);
    
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(CANVAS_WIDTH - 200, 35, 190, 20);
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(CANVAS_WIDTH - 200, 35, (player.mana / player.maxMana) * 190, 20);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`HP: ${Math.ceil(player.health)}/${player.maxHealth}`, CANVAS_WIDTH - 195, 25);
    ctx.fillText(`MP: ${Math.ceil(player.mana)}/${player.maxMana}`, CANVAS_WIDTH - 195, 50);
  });

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (gameState === 'menu') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">🏰</div>
          <h2 className="text-3xl font-bold mb-4">Dungeon of Desire</h2>
          <p className="text-gray-300 mb-8 max-w-md">
            Descend into the dungeon. Survive rooms and claim rewards.
          </p>
          <div className="space-y-4">
            <button
              onClick={startGame}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors text-lg font-semibold"
            >
              Enter Dungeon
            </button>
            <div className="text-sm text-gray-400 space-y-1">
              <p>🏃 WASD/Arrow Keys - Move</p>
              <p>✨ Space - Cast Spell</p>
              <p>⚡ Collect pickups to survive longer</p>
              <p>⏰ 1-hour time limit (optional)</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            "I didn't lose. Just ran out of health." – Edward Elric
          </p>
        </div>
      </div>
    );
  }

  if (gameState === 'paused') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/80">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Paused</h2>
          <button
            onClick={() => setGameState('playing')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
          >
            Resume
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver' || gameState === 'victory') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900 via-purple-900 to-black">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">
            {gameState === 'victory' ? '👑' : '💀'}
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {gameState === 'victory' ? 'Victory!' : 'Defeated'}
          </h2>
          <div className="space-y-2 mb-6">
            <div className="text-xl">Final Score: {score.toLocaleString()}</div>
            <div className="text-lg text-gray-300">Stage Reached: {stage}</div>
            <div className="text-lg text-gray-300">Survival Time: {formatTime(gameTime)}</div>
            {gameState === 'victory' && (
              <div className="text-yellow-400 font-bold">Dungeon Conquered! 🏆</div>
            )}
          </div>
          <div className="space-x-4">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
            >
              Try Again
            </button>
            <a
              href="/mini-games"
              className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl transition-colors"
            >
              Back to Hub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-black">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="flex-1 bg-black border border-purple-500/30"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}
