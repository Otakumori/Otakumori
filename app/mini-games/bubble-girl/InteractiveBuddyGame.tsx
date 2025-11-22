/**
 * Interactive Buddy - Physics-Based Interactive Character Game
 * Premium aesthetic with satisfying ragdoll physics and diverse interactions
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameControls, { CONTROL_PRESETS } from '@/components/GameControls';
import { PhysicsCharacterRenderer } from '../_shared/PhysicsCharacterRenderer';
import { createGlowEffect } from '../_shared/enhancedTextures';

type GameMode = 'sandbox' | 'stress-relief' | 'challenge';

interface Tool {
  id: string;
  name: string;
  icon: string;
  type: 'destructive' | 'fun' | 'healing';
  cost: number;
  damage?: number;
  effect?: string;
}

interface CharacterPart {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  angularVelocity: number;
  width: number;
  height: number;
  mass: number;
  health: number;
  maxHealth: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
  type: 'spark' | 'heart' | 'star' | 'impact';
}

interface GameState {
  score: number;
  money: number;
  stressRelieved: number;
  comboMultiplier: number;
  isRunning: boolean;
}

const TOOLS: Tool[] = [
  // Fun Tools
  { id: 'poke', name: 'Poke', icon: '↑', type: 'fun', cost: 0, damage: 5 },
  { id: 'tickle', name: 'Tickle', icon: '✦', type: 'fun', cost: 10, effect: 'giggle' },
  { id: 'compliment', name: 'Compliment', icon: '♥', type: 'healing', cost: 20, damage: -10 },
  { id: 'headpat', name: 'Head Pat', icon: '~', type: 'healing', cost: 15, damage: -15 },

  // Destructive Tools
  { id: 'slap', name: 'Slap', icon: '/', type: 'destructive', cost: 5, damage: 15 },
  { id: 'punch', name: 'Punch', icon: '✕', type: 'destructive', cost: 25, damage: 30 },
  { id: 'bat', name: 'Baseball Bat', icon: '|', type: 'destructive', cost: 50, damage: 50 },
  { id: 'bomb', name: 'Cherry Bomb', icon: '●', type: 'destructive', cost: 100, damage: 80 },
  { id: 'laser', name: 'Laser Beam', icon: '⚡', type: 'destructive', cost: 150, damage: 60 },

  // Special Tools
  { id: 'gravity', name: 'Anti-Gravity', icon: '○', type: 'fun', cost: 30, effect: 'float' },
  { id: 'wind', name: 'Wind Blast', icon: '≈', type: 'fun', cost: 40, effect: 'push' },
  { id: 'confetti', name: 'Confetti', icon: '✧', type: 'fun', cost: 25, effect: 'celebrate' },
];

export default function InteractiveBuddyGame({
  mode = 'sandbox',
  onScoreChange,
  onGameEnd: _onGameEnd, // Reserved for future win/lose conditions in stress-relief/challenge modes
  characterVariant = 'girl',
}: {
  mode?: GameMode;
  onScoreChange?: (score: number) => void;
  onGameEnd?: (score: number, didWin: boolean) => void;
  characterVariant?: 'girl' | 'boy';
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PhysicsEngine | null>(null);
  const animationRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    money: mode === 'sandbox' ? 1000 : 0,
    stressRelieved: 0,
    comboMultiplier: 1,
    isRunning: true,
  });

  const [selectedTool, setSelectedTool] = useState<Tool>(TOOLS[0]);

  // Initialize physics engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new PhysicsEngine(canvas, mode, characterVariant);
    engineRef.current = engine;

    const gameLoop = () => {
      if (!gameState.isRunning) return;

      engine.update(1 / 60);
      engine.render();

      // Update game state from engine
      const newScore = engine.getScore();
      setGameState((prev) => ({
        ...prev,
        score: newScore,
        money: engine.getMoney(),
        stressRelieved: engine.getStressRelieved(),
        comboMultiplier: engine.getComboMultiplier(),
      }));

      // Notify parent of score changes
      if (onScoreChange) {
        onScoreChange(newScore);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      engine.destroy();
    };
  }, [mode, characterVariant]);

  // Handle canvas interactions
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !engineRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

      // Check if we can afford the tool
      if (selectedTool.cost > gameState.money && mode !== 'sandbox') {
        // Play error sound/animation
        return;
      }

      // Use the selected tool
      engineRef.current.useTool(selectedTool, x, y);

      // Deduct cost (except in sandbox mode)
      if (mode !== 'sandbox' && selectedTool.cost > 0) {
        engineRef.current.spendMoney(selectedTool.cost);
      }
    },
    [selectedTool, gameState.money, mode],
  );

  // Handle drag interactions
  const handleCanvasDrag = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || event.buttons !== 1) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    engineRef.current.dragCharacter(x, y);
  }, []);

  // Reset character
  const handleReset = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resetCharacter();
    }
  }, []);

  return (
    <div className="relative">
      {/* Game Controls */}
      <GameControls
        game="Interactive Buddy"
        controls={[...CONTROL_PRESETS['bubble-girl']]}
        position="bottom-left"
        autoHideDelay={10000}
      />

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-auto cursor-crosshair rounded-2xl border border-pink-500/20 shadow-2xl transition-all hover:border-pink-500/40 bg-gradient-to-br from-purple-900/20 to-pink-900/20"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasDrag}
        aria-label="Interactive Buddy game area - click or drag to interact with character"
      />

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="bg-black/80 backdrop-blur-lg px-4 py-2 rounded-xl border border-pink-500/30 text-pink-200 font-medium">
          Score: <span className="text-pink-400 font-bold">{gameState.score.toLocaleString()}</span>
        </div>
        {mode !== 'sandbox' && (
          <div className="bg-black/80 backdrop-blur-lg px-4 py-2 rounded-xl border border-yellow-500/30 text-yellow-200 font-medium">
            Money: <span className="text-yellow-400 font-bold">${gameState.money}</span>
          </div>
        )}
        {gameState.comboMultiplier > 1 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-orange-500/40 to-red-500/40 backdrop-blur-lg px-4 py-2 rounded-xl border border-red-400/50 text-white font-bold"
          >
            <span className="text-yellow-300">★</span> {gameState.comboMultiplier.toFixed(1)}x
            COMBO!
          </motion.div>
        )}
      </div>

      {/* Tool Selection */}
      <div className="absolute top-4 right-4 max-w-xs">
        <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-pink-500/30 p-4">
          <h3 className="text-pink-300 font-bold mb-3 flex items-center gap-2">
            <span className="text-xl">⚙</span> Tools
          </h3>

          <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto custom-scrollbar">
            {TOOLS.map((tool) => {
              const canAfford = mode === 'sandbox' || tool.cost <= gameState.money;
              const isSelected = selectedTool.id === tool.id;

              return (
                <motion.button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  className={`p-3 rounded-lg font-medium transition-all text-center ${
                    isSelected
                      ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50 scale-105'
                      : canAfford
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        : 'bg-black/30 text-gray-500 border border-gray-700 cursor-not-allowed opacity-50'
                  }`}
                  whileHover={canAfford ? { scale: 1.05 } : {}}
                  whileTap={canAfford ? { scale: 0.95 } : {}}
                  disabled={!canAfford}
                  title={tool.name}
                >
                  <div className="text-2xl mb-1">{tool.icon}</div>
                  <div className="text-xs truncate">{tool.name}</div>
                  {tool.cost > 0 && (
                    <div className="text-xs text-yellow-400 mt-1">${tool.cost}</div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Reset Button */}
          <motion.button
            onClick={handleReset}
            className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-lg transition-all shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ↻ Reset Character
          </motion.button>
        </div>
      </div>

      {/* Selected Tool Indicator */}
      <div className="absolute bottom-4 right-4">
        <div className="bg-black/80 backdrop-blur-lg px-6 py-3 rounded-xl border border-pink-500/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedTool.icon}</span>
            <div>
              <div className="text-pink-200 font-bold">{selectedTool.name}</div>
              <div className="text-xs text-pink-300/70 capitalize">{selectedTool.type}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Physics Engine Class
class PhysicsEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mode: GameMode;

  // Character (simplified ragdoll)
  private character: {
    head: CharacterPart;
    torso: CharacterPart;
    isDragging: boolean;
    dragOffsetX: number;
    dragOffsetY: number;
  };

  // Game state
  private score: number = 0;
  private money: number = 0;
  private stressRelieved: number = 0;
  private comboMultiplier: number = 1;
  private lastHitTime: number = 0;
  private particles: Particle[] = [];

  // Physics constants
  private readonly GRAVITY = 0.5;
  private readonly FRICTION = 0.98;
  private readonly BOUNCE = 0.6;

  private characterVariant: 'girl' | 'boy';

  // Physics character renderer
  private physicsRenderer: PhysicsCharacterRenderer | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    mode: GameMode,
    characterVariant: 'girl' | 'boy' = 'girl',
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.mode = mode;
    this.characterVariant = characterVariant;
    this.money = mode === 'sandbox' ? 10000 : 50;

    // Initialize physics renderer
    this.physicsRenderer = new PhysicsCharacterRenderer(
      this.ctx,
      characterVariant === 'girl' ? 'succubus' : 'player',
      { quality: 'high', enabled: true },
    );

    // Initialize character
    this.character = {
      head: {
        x: canvas.width / 2,
        y: 150,
        vx: 0,
        vy: 0,
        rotation: 0,
        angularVelocity: 0,
        width: 80,
        height: 80,
        mass: 1,
        health: 100,
        maxHealth: 100,
      },
      torso: {
        x: canvas.width / 2,
        y: 280,
        vx: 0,
        vy: 0,
        rotation: 0,
        angularVelocity: 0,
        width: 100,
        height: 120,
        mass: 2,
        health: 100,
        maxHealth: 100,
      },
      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0,
    };
  }

  update(deltaTime: number): void {
    const { head, torso } = this.character;

    // Apply gravity if not dragging
    if (!this.character.isDragging) {
      head.vy += this.GRAVITY;
      torso.vy += this.GRAVITY;
    }

    // Update positions
    head.x += head.vx * deltaTime * 60;
    head.y += head.vy * deltaTime * 60;
    torso.x += torso.vx * deltaTime * 60;
    torso.y += torso.vy * deltaTime * 60;

    // Apply friction
    head.vx *= this.FRICTION;
    head.vy *= this.FRICTION;
    torso.vx *= this.FRICTION;
    torso.vy *= this.FRICTION;

    // Update rotations
    head.rotation += head.angularVelocity * deltaTime * 60;
    torso.rotation += torso.angularVelocity * deltaTime * 60;
    head.angularVelocity *= 0.95;
    torso.angularVelocity *= 0.95;

    // Floor collision
    if (head.y + head.height / 2 > this.canvas.height - 50) {
      head.y = this.canvas.height - 50 - head.height / 2;
      head.vy *= -this.BOUNCE;
      head.angularVelocity *= 0.8;
    }
    if (torso.y + torso.height / 2 > this.canvas.height - 50) {
      torso.y = this.canvas.height - 50 - torso.height / 2;
      torso.vy *= -this.BOUNCE;
      torso.angularVelocity *= 0.8;
    }

    // Wall collisions
    [head, torso].forEach((part) => {
      if (part.x - part.width / 2 < 0) {
        part.x = part.width / 2;
        part.vx *= -this.BOUNCE;
      }
      if (part.x + part.width / 2 > this.canvas.width) {
        part.x = this.canvas.width - part.width / 2;
        part.vx *= -this.BOUNCE;
      }
    });

    // Update particles
    this.particles = this.particles.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // Gravity for particles
      particle.life -= 0.02;
      return particle.life > 0;
    });

    // Decay combo multiplier
    if (Date.now() - this.lastHitTime > 2000) {
      this.comboMultiplier = Math.max(1, this.comboMultiplier - 0.01);
    }

    // Update physics renderer
    if (this.physicsRenderer) {
      const centerX = torso.x;
      const centerY = torso.y;
      const velocityX = torso.vx;
      const velocityY = torso.vy;
      this.physicsRenderer.update(
        deltaTime,
        { x: velocityX, y: velocityY },
        { x: centerX, y: centerY },
      );
    }
  }

  render(): void {
    // Clear canvas with gradient background - Enhanced
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a0b2e');
    gradient.addColorStop(0.5, '#2e0b1a');
    gradient.addColorStop(1, '#0f0718');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Enhanced background overlay
    const overlayGradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      Math.max(this.canvas.width, this.canvas.height),
    );
    overlayGradient.addColorStop(0, 'rgba(236, 72, 153, 0.1)');
    overlayGradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = overlayGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw floor
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
    this.ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height - 50);
    this.ctx.lineTo(this.canvas.width, this.canvas.height - 50);
    this.ctx.stroke();

    // Draw particles
    this.particles.forEach((particle) => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;

      if (particle.type === 'heart') {
        this.drawHeart(particle.x, particle.y, particle.size);
      } else if (particle.type === 'star') {
        this.drawStar(particle.x, particle.y, particle.size);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });

    // Draw character with physics
    if (this.physicsRenderer) {
      const { torso } = this.character;
      // Use physics renderer
      this.physicsRenderer.render(torso.x, torso.y, 'right');

      // Draw health bars
      this.drawHealthBar(torso.x, torso.y - 80, torso.width, torso.health, torso.maxHealth);
    } else {
      // Fallback to original rendering
      this.drawCharacter();
    }
  }

  private drawCharacter(): void {
    const { head, torso } = this.character;

    // Draw torso (body)
    this.ctx.save();
    this.ctx.translate(torso.x, torso.y);
    this.ctx.rotate(torso.rotation);

    // Body gradient - different colors for boy vs girl
    const bodyGradient = this.ctx.createLinearGradient(
      -torso.width / 2,
      -torso.height / 2,
      torso.width / 2,
      torso.height / 2,
    );
    if (this.characterVariant === 'boy') {
      bodyGradient.addColorStop(0, '#87ceeb'); // Sky blue
      bodyGradient.addColorStop(1, '#4682b4'); // Steel blue
    } else {
      bodyGradient.addColorStop(0, '#ff9fbe');
      bodyGradient.addColorStop(1, '#ec4899');
    }

    // Draw body
    this.ctx.fillStyle = bodyGradient;
    this.ctx.beginPath();
    this.ctx.roundRect(-torso.width / 2, -torso.height / 2, torso.width, torso.height, 15);
    this.ctx.fill();

    // Outfit details
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.fillRect(-torso.width / 3, -torso.height / 3, 10, torso.height / 2);
    this.ctx.fillRect(torso.width / 3 - 10, -torso.height / 3, 10, torso.height / 2);

    this.ctx.restore();

    // Draw head
    this.ctx.save();
    this.ctx.translate(head.x, head.y);
    this.ctx.rotate(head.rotation);

    // Head (face) - different colors for boy vs girl
    const headGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, head.width / 2);
    if (this.characterVariant === 'boy') {
      headGradient.addColorStop(0, '#e0f2fe'); // Light blue
      headGradient.addColorStop(1, '#b3e5fc'); // Sky blue
    } else {
      headGradient.addColorStop(0, '#ffc7d9');
      headGradient.addColorStop(1, '#ff9fbe');
    }

    this.ctx.fillStyle = headGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, head.width / 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Face features
    // Eyes
    this.ctx.fillStyle = '#2d1b3d';
    this.ctx.beginPath();
    this.ctx.arc(-15, -5, 6, 0, Math.PI * 2);
    this.ctx.arc(15, -5, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Eye shine
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(-13, -7, 2, 0, Math.PI * 2);
    this.ctx.arc(17, -7, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Blush (only for girl variant)
    if (this.characterVariant === 'girl') {
      this.ctx.fillStyle = 'rgba(255, 105, 180, 0.3)';
      this.ctx.beginPath();
      this.ctx.ellipse(-20, 8, 8, 5, 0, 0, Math.PI * 2);
      this.ctx.ellipse(20, 8, 8, 5, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Mouth (happy)
    this.ctx.strokeStyle = '#2d1b3d';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(0, 10, 12, 0.2, Math.PI - 0.2);
    this.ctx.stroke();

    this.ctx.restore();

    // Draw health bars
    this.drawHealthBar(
      head.x,
      head.y - head.height / 2 - 15,
      head.width,
      head.health,
      head.maxHealth,
    );
    this.drawHealthBar(
      torso.x,
      torso.y - torso.height / 2 - 15,
      torso.width,
      torso.health,
      torso.maxHealth,
    );
  }

  private drawHealthBar(
    x: number,
    y: number,
    width: number,
    health: number,
    maxHealth: number,
  ): void {
    const barWidth = width * 0.8;
    const barHeight = 6;
    const healthPercent = health / maxHealth;

    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);

    // Health
    const healthColor =
      healthPercent > 0.6 ? '#4ade80' : healthPercent > 0.3 ? '#fb923c' : '#ef4444';
    this.ctx.fillStyle = healthColor;
    this.ctx.fillRect(x - barWidth / 2, y, barWidth * healthPercent, barHeight);

    // Border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - barWidth / 2, y, barWidth, barHeight);
  }

  private drawHeart(x: number, y: number, size: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + size / 4);
    this.ctx.bezierCurveTo(x, y, x - size / 2, y - size / 2, x - size / 2, y + size / 4);
    this.ctx.bezierCurveTo(x - size / 2, y + size, x, y + size * 1.3, x, y + size * 1.5);
    this.ctx.bezierCurveTo(x, y + size * 1.3, x + size / 2, y + size, x + size / 2, y + size / 4);
    this.ctx.bezierCurveTo(x + size / 2, y - size / 2, x, y, x, y + size / 4);
    this.ctx.fill();
  }

  private drawStar(x: number, y: number, size: number): void {
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const px = x + Math.cos(angle) * size;
      const py = y + Math.sin(angle) * size;
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  useTool(tool: Tool, x: number, y: number): void {
    const { head, torso } = this.character;

    // Check which part was hit
    const hitHead = this.checkHit(head, x, y);
    const hitTorso = this.checkHit(torso, x, y);
    const hitPart = hitHead ? head : hitTorso ? torso : null;

    if (!hitPart) return;

    // Apply damage/healing
    const damage = tool.damage || 0;
    hitPart.health = Math.max(0, Math.min(hitPart.maxHealth, hitPart.health - damage));

    // Apply physics force
    const dx = hitPart.x - x;
    const dy = hitPart.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    const force = tool.type === 'destructive' ? 0.5 : 0.2;

    hitPart.vx += (dx / distance) * force * (damage || 5);
    hitPart.vy += (dy / distance) * force * (damage || 5) - 2;
    hitPart.angularVelocity += (Math.random() - 0.5) * 0.1;

    // Apply physics impact
    if (this.physicsRenderer) {
      const impactForce = {
        x: (dx / distance) * force * (damage || 5) * 2,
        y: ((dy / distance) * force * (damage || 5) - 2) * 2,
      };
      const impactPart = hitHead ? 'chest' : 'hips';
      this.physicsRenderer.applyImpact(impactForce, impactPart);
    }

    // Update combo
    const now = Date.now();
    if (now - this.lastHitTime < 1000) {
      this.comboMultiplier = Math.min(5, this.comboMultiplier + 0.1);
    } else {
      this.comboMultiplier = 1;
    }
    this.lastHitTime = now;

    // Update score and money
    const pointsEarned = Math.floor((tool.damage || 5) * this.comboMultiplier);
    // Prevent score exploits - cap score increment per action
    const cappedPoints = Math.min(pointsEarned, 1000); // Max 1000 points per action
    this.score = Math.min(this.score + cappedPoints, 999999); // Cap total score at 999,999
    this.money += Math.floor(cappedPoints / 10);
    this.stressRelieved += tool.type === 'destructive' ? 1 : 0;

    // Spawn particles - Enhanced with glow
    this.spawnParticles(x, y, tool.type);

    // Enhanced particle effects
    if (tool.type === 'destructive') {
      createGlowEffect(this.ctx, x, y, 30, '#ef4444', 0.5);
    } else if (tool.type === 'healing') {
      createGlowEffect(this.ctx, x, y, 25, '#4ade80', 0.4);
    } else {
      createGlowEffect(this.ctx, x, y, 20, '#ec4899', 0.3);
    }
  }

  private checkHit(part: CharacterPart, x: number, y: number): boolean {
    return (
      x > part.x - part.width / 2 &&
      x < part.x + part.width / 2 &&
      y > part.y - part.height / 2 &&
      y < part.y + part.height / 2
    );
  }

  private spawnParticles(x: number, y: number, type: string): void {
    const count = 8 + Math.floor(Math.random() * 8);
    const colors =
      type === 'destructive'
        ? ['#ef4444', '#f97316', '#fb923c']
        : type === 'healing'
          ? ['#4ade80', '#86efac', '#bbf7d0']
          : ['#ec4899', '#f472b6', '#fbbf24'];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 2 + Math.random() * 4;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1.0,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: type === 'healing' ? 'heart' : type === 'fun' ? 'star' : 'impact',
      });
    }
  }

  dragCharacter(x: number, y: number): void {
    const { head, torso } = this.character;

    if (!this.character.isDragging) {
      // Start dragging if near character
      if (this.checkHit(head, x, y)) {
        this.character.isDragging = true;
        this.character.dragOffsetX = x - head.x;
        this.character.dragOffsetY = y - head.y;
      } else if (this.checkHit(torso, x, y)) {
        this.character.isDragging = true;
        this.character.dragOffsetX = x - torso.x;
        this.character.dragOffsetY = y - torso.y;
      }
    }

    if (this.character.isDragging) {
      head.x = x - this.character.dragOffsetX;
      head.y = y - this.character.dragOffsetY;
      head.vx = 0;
      head.vy = 0;
    }
  }

  resetCharacter(): void {
    this.character.head.x = this.canvas.width / 2;
    this.character.head.y = 150;
    this.character.head.vx = 0;
    this.character.head.vy = 0;
    this.character.head.rotation = 0;
    this.character.head.angularVelocity = 0;
    this.character.head.health = this.character.head.maxHealth;

    this.character.torso.x = this.canvas.width / 2;
    this.character.torso.y = 280;
    this.character.torso.vx = 0;
    this.character.torso.vy = 0;
    this.character.torso.rotation = 0;
    this.character.torso.angularVelocity = 0;
    this.character.torso.health = this.character.torso.maxHealth;

    this.particles = [];
  }

  spendMoney(amount: number): void {
    this.money -= amount;
  }

  getScore(): number {
    return this.score;
  }

  getMoney(): number {
    return this.money;
  }

  getStressRelieved(): number {
    return this.stressRelieved;
  }

  getComboMultiplier(): number {
    return this.comboMultiplier;
  }

  destroy(): void {
    // Cleanup physics renderer
    if (this.physicsRenderer) {
      this.physicsRenderer.dispose();
      this.physicsRenderer = null;
    }
  }
}
