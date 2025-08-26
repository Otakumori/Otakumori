/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import * as PIXI from 'pixi.js';
import { GameDefinition } from '@/app/lib/games';
import { createGameLoop } from '@/app/lib/game-loop';
import { bindAction, onInput, InputEvent } from '@/app/lib/input-manager';
import { playSfx, getSprite } from '@/app/lib/assets';
import { gameApi } from '@/app/lib/http';

interface SamuraiPetalSliceProps {
  gameDef: GameDefinition;
}

interface Petal {
  sprite: PIXI.Sprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  scale: number;
  targetAngle: number;
  sliced: boolean;
}

interface SliceTrail {
  points: PIXI.Point[];
  alpha: number;
  width: number;
}

export default function SamuraiPetalSlice({ gameDef }: SamuraiPetalSliceProps) {
  const { user } = useUser();
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const gameLoopRef = useRef<ReturnType<typeof createGameLoop> | null>(null);
  const gameStateRef = useRef({
    isPlaying: false,
    score: 0,
    swings: 0,
    perfectArcs: 0,
    misses: 0,
    longestCombo: 0,
    currentCombo: 0,
    startTime: 0,
    timeToClear: 0,
    leftHanded: false,
    muted: false
  });

  const [gameState, setGameState] = useState({
    isPlaying: false,
    score: 0,
    swings: 0,
    perfectArcs: 0,
    misses: 0,
    longestCombo: 0,
    currentCombo: 0,
    timeToClear: 0
  });

  const [runId, setRunId] = useState<string | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Game objects
  const petalsRef = useRef<Petal[]>([]);
  const sliceTrailsRef = useRef<SliceTrail[]>([]);
  const katanaRef = useRef<PIXI.Sprite | null>(null);
  const scoreTextRef = useRef<PIXI.Text | null>(null);
  const comboTextRef = useRef<PIXI.Text | null>(null);

  // Input handling
  const isMouseDown = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });

  const initializeGame = useCallback(async () => {
    if (!canvasRef.current || !user) return;

    try {
      // Start game run
      const idempotencyKey = `samurai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const response = await gameApi.start(gameDef.key, idempotencyKey);
      
      if (response.ok && response.data) {
        setRunId((response.data as any).runId);
        setSeed((response.data as any).seed);
      }

      // Initialize PIXI app
      const app = new PIXI.Application({
        width: 800,
        height: 600,
        backgroundColor: 0xf8f9fa,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      });

      canvasRef.current.appendChild(app.view as any);
      appRef.current = app;

      // Create game objects
      await createGameObjects(app);

      // Set up input handling
      setupInputHandling(app);

      // Start game loop
      gameLoopRef.current = createGameLoop({
        targetFPS: 60,
        onUpdate: updateGame,
        onRender: renderGame,
        onError: (error) => console.error('Game loop error:', error)
      });

      gameLoopRef.current.start();

      // Start the game
      startGame();

    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  }, [gameDef.key, user]);

  const createGameObjects = async (app: PIXI.Application) => {
    // Background
    const background = new PIXI.Graphics();
    background.beginFill(0xf8f9fa);
    background.drawRect(0, 0, 800, 600);
    background.endFill();
    app.stage.addChild(background);

    // Dojo background elements
    const dojoElements = new PIXI.Graphics();
    dojoElements.lineStyle(2, 0xe9ecef);
    
    // Simple dojo design
    for (let i = 0; i < 5; i++) {
      dojoElements.moveTo(0, 100 + i * 100);
      dojoElements.lineTo(800, 100 + i * 100);
    }
    app.stage.addChild(dojoElements);

    // Katana
    const katanaTexture = await getSprite('katana', 'triangle');
    katanaRef.current = new PIXI.Sprite(PIXI.Texture.from(katanaTexture));
    katanaRef.current.anchor.set(0.5, 0.5);
    katanaRef.current.width = 60;
    katanaRef.current.height = 20;
    katanaRef.current.visible = false;
    app.stage.addChild(katanaRef.current);

    // Score text
    scoreTextRef.current = new PIXI.Text('Score: 0', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0x495057,
      stroke: { color: 0xffffff, width: 2 }
    });
    scoreTextRef.current.x = 20;
    scoreTextRef.current.y = 20;
    app.stage.addChild(scoreTextRef.current);

    // Combo text
    comboTextRef.current = new PIXI.Text('Combo: 0', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0x6f42c1,
      stroke: { color: 0xffffff, width: 1 }
    });
    comboTextRef.current.x = 20;
    comboTextRef.current.y = 50;
    app.stage.addChild(comboTextRef.current);
  };

  const setupInputHandling = (app: PIXI.Application) => {
    const canvas = app.view as any;

    // Mouse events
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    // Keyboard events
    bindAction('slice', { action: 'slice', keys: ['Space'], touchGestures: ['tap'] });
    bindAction('reset', { action: 'reset', keys: ['KeyR'] });
    bindAction('leftHanded', { action: 'leftHanded', keys: ['KeyL'] });

    onInput('slice', handleSlice);
    onInput('reset', handleReset);
    onInput('leftHanded', handleLeftHanded);
  };

  const handleMouseDown = (event: MouseEvent) => {
    isMouseDown.current = true;
    lastMousePos.current = { x: event.clientX, y: event.clientY };
    mousePos.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseMove = (event: MouseEvent) => {
    mousePos.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
  };

  const handleTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    isMouseDown.current = true;
    lastMousePos.current = { x: touch.clientX, y: touch.clientY };
    mousePos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (event: TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    mousePos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault();
    isMouseDown.current = false;
  };

  const handleSlice = () => {
    if (!isMouseDown.current) return;
    
    const dx = mousePos.current.x - lastMousePos.current.x;
    const dy = mousePos.current.y - lastMousePos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 10) {
      performSlice(lastMousePos.current, mousePos.current);
    }
  };

  const handleReset = () => {
    if (gameStateRef.current.isPlaying) {
      resetGame();
    }
  };

  const handleLeftHanded = () => {
    gameStateRef.current.leftHanded = !gameStateRef.current.leftHanded;
  };

  const performSlice = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    if (!appRef.current) return;

    gameStateRef.current.swings++;
    setGameState(prev => ({ ...prev, swings: gameStateRef.current.swings }));

    // Create slice trail
    const trail: SliceTrail = {
      points: [
        new PIXI.Point(start.x, start.y),
        new PIXI.Point(end.x, end.y)
      ],
      alpha: 1.0,
      width: 4
    };
    sliceTrailsRef.current.push(trail);

    // Check for petal hits
    const sliceAngle = Math.atan2(end.y - start.y, end.x - start.x);
    let hitCount = 0;

    petalsRef.current.forEach(petal => {
      if (petal.sliced) return;

      const distance = Math.sqrt(
        Math.pow(petal.x - start.x, 2) + Math.pow(petal.y - start.y, 2)
      );

      if (distance < 50) {
        const angleDiff = Math.abs(sliceAngle - petal.targetAngle);
        const isPerfect = angleDiff < 0.3; // ~17 degrees

        if (isPerfect) {
          gameStateRef.current.perfectArcs++;
          hitCount++;
          petal.sliced = true;
          
          // Perfect slice effect
          createSliceEffect(petal.x, petal.y, true);
          playSfx('petal-burst');
        }
      }
    });

    if (hitCount > 0) {
      gameStateRef.current.currentCombo += hitCount;
      gameStateRef.current.longestCombo = Math.max(
        gameStateRef.current.longestCombo,
        gameStateRef.current.currentCombo
      );
      
      const comboBonus = Math.floor(gameStateRef.current.currentCombo / 3) * 10;
      gameStateRef.current.score += hitCount * 100 + comboBonus;
      
      setGameState(prev => ({
        ...prev,
        perfectArcs: gameStateRef.current.perfectArcs,
        currentCombo: gameStateRef.current.currentCombo,
        longestCombo: gameStateRef.current.longestCombo,
        score: gameStateRef.current.score
      }));

      playSfx('combo-chime');
    } else {
      gameStateRef.current.currentCombo = 0;
      gameStateRef.current.misses++;
      setGameState(prev => ({
        ...prev,
        currentCombo: 0,
        misses: gameStateRef.current.misses
      }));
    }

    playSfx('sword-slice');
  };

  const createSliceEffect = (x: number, y: number, isPerfect: boolean) => {
    if (!appRef.current) return;

    const effect = new PIXI.Graphics();
    effect.beginFill(isPerfect ? 0xffd700 : 0xff6b6b);
    effect.drawCircle(0, 0, isPerfect ? 20 : 15);
    effect.endFill();
    effect.x = x;
    effect.y = y;
    effect.alpha = 0.8;

    appRef.current.stage.addChild(effect);

    // Animate effect
    const animate = () => {
      effect.alpha -= 0.05;
      effect.scale.x += 0.1;
      effect.scale.y += 0.1;

      if (effect.alpha <= 0) {
        appRef.current?.stage.removeChild(effect);
      } else {
        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const spawnPetal = async () => {
    if (!appRef.current) return;

    const petalTexture = await getSprite('petals', 'circle');
    const petal = new PIXI.Sprite(PIXI.Texture.from(petalTexture));
    
    petal.anchor.set(0.5, 0.5);
    petal.width = 30;
    petal.height = 30;
    
    // Random spawn position
    petal.x = Math.random() * 700 + 50;
    petal.y = -50;
    
    // Random velocity
    const vx = (Math.random() - 0.5) * 2;
    const vy = Math.random() * 2 + 1;
    
    // Random rotation
    const rotation = Math.random() * Math.PI * 2;
    const vr = (Math.random() - 0.5) * 0.2;
    
    // Random scale
    const scale = 0.8 + Math.random() * 0.4;
    
    // Target angle for perfect slice
    const targetAngle = Math.random() * Math.PI * 2;

    const petalObj: Petal = {
      sprite: petal,
      x: petal.x,
      y: petal.y,
      vx,
      vy,
      rotation,
      vr,
      scale,
      targetAngle,
      sliced: false
    };

    petalsRef.current.push(petalObj);
    appRef.current.stage.addChild(petal);

    // Set petal properties
    petal.rotation = rotation;
    petal.scale.set(scale);
  };

  const updateGame = (deltaTime: number) => {
    if (!gameStateRef.current.isPlaying) return;

    // Spawn petals
    if (Math.random() < 0.02) { // 2% chance per frame
      spawnPetal().catch(console.error);
    }

    // Update petals
    petalsRef.current.forEach((petal, index) => {
      petal.x += petal.vx;
      petal.y += petal.vy;
      petal.rotation += petal.vr;
      petal.scale += 0.001;

      petal.sprite.x = petal.x;
      petal.sprite.y = petal.y;
      petal.sprite.rotation = petal.rotation;
      petal.sprite.scale.set(petal.scale);

      // Remove off-screen petals
      if (petal.y > 650 || petal.x < -50 || petal.x > 850) {
        if (!petal.sliced) {
          gameStateRef.current.misses++;
          setGameState(prev => ({ ...prev, misses: gameStateRef.current.misses }));
        }
        
        appRef.current?.stage.removeChild(petal.sprite);
        petalsRef.current.splice(index, 1);
      }
    });

    // Update slice trails
    sliceTrailsRef.current.forEach((trail, index) => {
      trail.alpha -= 0.02;
      trail.width -= 0.1;

      if (trail.alpha <= 0) {
        sliceTrailsRef.current.splice(index, 1);
      }
    });

    // Update UI
    if (scoreTextRef.current) {
      scoreTextRef.current.text = `Score: ${gameStateRef.current.score}`;
    }
    
    if (comboTextRef.current) {
      comboTextRef.current.text = `Combo: ${gameStateRef.current.currentCombo}`;
      comboTextRef.current.visible = gameStateRef.current.currentCombo > 0;
    }

    // Check game over condition
    if (gameStateRef.current.misses >= 10) {
      endGame();
    }
  };

  const renderGame = (alpha: number) => {
    if (!appRef.current) return;

    // Render slice trails
    sliceTrailsRef.current.forEach(trail => {
      const graphics = new PIXI.Graphics();
      graphics.lineStyle(trail.width, 0xff6b6b, trail.alpha);
      graphics.moveTo(trail.points[0].x, trail.points[0].y);
      graphics.lineTo(trail.points[1].x, trail.points[1].y);
      appRef.current!.stage.addChild(graphics);

      // Remove after rendering
      setTimeout(() => {
        if (graphics.parent) {
          graphics.parent.removeChild(graphics);
        }
      }, 16);
    });
  };

  const startGame = () => {
    gameStateRef.current.isPlaying = true;
    gameStateRef.current.startTime = Date.now();
    setGameState(prev => ({ ...prev, isPlaying: true }));
    playSfx('sword-draw');
  };

  const endGame = async () => {
    if (!gameStateRef.current.isPlaying) return;

    gameStateRef.current.isPlaying = false;
    gameStateRef.current.timeToClear = Date.now() - gameStateRef.current.startTime;
    
    setGameState(prev => ({ ...prev, isPlaying: false }));
    setIsGameOver(true);

    // Stop game loop
    if (gameLoopRef.current) {
      gameLoopRef.current.stop();
    }

    // Send results to server
    if (runId) {
      try {
        const statsHash = btoa(JSON.stringify({
          score: gameStateRef.current.score,
          swings: gameStateRef.current.swings,
          perfectArcs: gameStateRef.current.perfectArcs,
          misses: gameStateRef.current.misses,
          longestCombo: gameStateRef.current.longestCombo,
          timeToClear: gameStateRef.current.timeToClear
        }));

        const response = await gameApi.finish(
          runId,
          gameStateRef.current.score,
          statsHash,
          {
            swings: gameStateRef.current.swings,
            perfectArcs: gameStateRef.current.perfectArcs,
            misses: gameStateRef.current.misses,
            longestCombo: gameStateRef.current.longestCombo,
            timeToClear: gameStateRef.current.timeToClear,
            leftHanded: gameStateRef.current.leftHanded,
            muted: gameStateRef.current.muted
          }
        );

        if (response.ok && response.data) {
          setShowResults(true);
        }
      } catch (error) {
        console.error('Failed to send game results:', error);
      }
    }

    playSfx(gameStateRef.current.score > 0 ? 'victory-chime' : 'defeat-thud');
  };

  const resetGame = () => {
    // Clear petals
    petalsRef.current.forEach(petal => {
      if (petal.sprite.parent) {
        petal.sprite.parent.removeChild(petal.sprite);
      }
    });
    petalsRef.current = [];

    // Clear slice trails
    sliceTrailsRef.current = [];

    // Reset game state
    gameStateRef.current = {
      isPlaying: false,
      score: 0,
      swings: 0,
      perfectArcs: 0,
      misses: 0,
      longestCombo: 0,
      currentCombo: 0,
      startTime: 0,
      timeToClear: 0,
      leftHanded: gameStateRef.current.leftHanded,
      muted: gameStateRef.current.muted
    };

    setGameState({
      isPlaying: false,
      score: 0,
      swings: 0,
      perfectArcs: 0,
      misses: 0,
      longestCombo: 0,
      currentCombo: 0,
      timeToClear: 0
    });

    setIsGameOver(false);
    setShowResults(false);
    setRunId(null);
    setSeed(null);

    // Restart game loop
    if (gameLoopRef.current) {
      gameLoopRef.current.start();
    }
  };

  useEffect(() => {
    initializeGame();

    return () => {
      if (gameLoopRef.current) {
        gameLoopRef.current.dispose();
      }
      if (appRef.current) {
        appRef.current.destroy(true);
      }
    };
  }, [initializeGame]);

  if (showResults) {
  return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Game Complete!
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Final Score:</span>
              <span className="font-semibold text-pink-600">{gameState.score}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Perfect Slices:</span>
              <span className="font-semibold text-green-600">{gameState.perfectArcs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Longest Combo:</span>
              <span className="font-semibold text-purple-600">{gameState.longestCombo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Swings:</span>
              <span className="font-semibold text-blue-600">{gameState.swings}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetGame}
              className="flex-1 py-2 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Play Again
            </button>
        <button 
              onClick={() => window.location.href = '/mini-games'}
              className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
              Back to Games
        </button>
      </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4">
      {!gameState.isPlaying && !isGameOver && (
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            {gameDef.name}
          </h3>
          <p className="text-gray-600 mb-4 max-w-md">
            {gameDef.howToPlay}
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Swipe to slice petals with perfect timing</p>
            <p>• Chain combos for bonus rewards</p>
            <p>• Avoid missing too many petals</p>
          </div>
          <button
            onClick={startGame}
            className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            Start Game
          </button>
        </div>
      )}

      {isGameOver && !showResults && (
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Game Over!
          </h3>
          <p className="text-gray-600 mb-4">
            Final Score: {gameState.score}
          </p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Game Canvas */}
      <div 
        ref={canvasRef}
        className="border-2 border-pink-200 rounded-lg overflow-hidden"
        style={{ width: '800px', height: '600px' }}
      />

      {/* Game Controls */}
      {gameState.isPlaying && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Click and drag to slice • R to reset • L for left-handed mode</p>
        </div>
      )}
    </div>
  );
}
