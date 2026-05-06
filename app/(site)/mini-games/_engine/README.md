# Universal Game Runtime Framework

A reusable mini-game runtime framework that provides a consistent lifecycle and architecture for all games.

## Architecture

The runtime follows a strict state machine pattern:

```
Boot → Preload → Title → Play → Pause → Results → Persist
```

### State Flow

1. **Boot**: Initial state when runtime is created
2. **Preload**: Assets and resources are loaded with progress reporting
3. **Title**: Title screen shown, waiting for user to start
4. **Play**: Game is running (RAF loop active)
5. **Pause**: Game is paused (can resume or restart)
6. **Results**: Game ended, showing results screen
7. **Persist**: Saving game data to backend (optional)

## Core Components

### `GameRuntime` (Class)

Manages the game lifecycle state machine and RAF loop.

```typescript
import { GameRuntime } from '@/app/mini-games/_engine';

const runtime = new GameRuntime(game, 'My Game', {
  targetFPS: 60,
  fixedTimestep: true,
  fixedDelta: 1 / 60,
});

runtime.initialize(canvas);
runtime.setCallbacks({
  onStateChange: (state) => console.log('State:', state),
  onProgress: (progress) => console.log('Progress:', progress.percentage),
  onResults: (results) => console.log('Results:', results),
});
```

### `GameCanvas` (Component)

Mounts canvas once and never re-renders per-frame. All rendering happens inside the runtime loop.

```typescript
import { GameCanvas } from '@/app/mini-games/_engine';

<GameCanvas
  runtime={runtime}
  className="w-full h-full"
  onMouseMove={(x, y) => game.handleMouseMove(x, y)}
/>
```

### `GameOverlay` (Component)

React UI for title, pause, and results screens. Only updates on state changes, not per-frame.

```typescript
import { GameOverlay } from '@/app/mini-games/_engine';

<GameOverlay
  runtime={runtime}
  title="My Game"
  onStart={() => console.log('Game started')}
  onRestart={() => console.log('Game restarted')}
  onQuit={() => router.push('/mini-games')}
/>
```

## Game Interface

All games must implement the `Game` interface:

```typescript
import type { Game, GameProgress, GameContext, GameResults } from '@/app/mini-games/_engine';

class MyGame implements Game {
  async preload(onProgress: (progress: GameProgress) => void): Promise<void> {
    // Load assets, report progress
    for (let i = 0; i < totalAssets; i++) {
      await loadAsset(i);
      onProgress({ loaded: i + 1, total: totalAssets, percentage: ((i + 1) / totalAssets) * 100 });
    }
  }

  start(context: GameContext): void {
    // Initialize game with canvas context
    this.ctx = context.canvas?.getContext('2d');
    // Set up initial state
  }

  update(dt: number): void {
    // Update game logic (called every frame)
    // dt is delta time in seconds
  }

  render(context: GameContext): void {
    // Render game (called every frame)
    // Use context.canvas for rendering
  }

  onPause(): void {
    // Pause animations, audio, etc.
  }

  onResume(): void {
    // Resume animations, audio, etc.
  }

  getResults(): GameResults {
    return {
      score: this.score,
      stats: { /* custom stats */ },
      durationMs: this.duration,
    };
  }

  teardown(): void {
    // Cleanup resources
  }
}
```

## Usage Example

```typescript
'use client';

import { useEffect, useState } from 'react';
import { GameRuntime, GameCanvas, GameOverlay } from '@/app/mini-games/_engine';
import { MyGame } from './MyGame';

export default function MyGamePage() {
  const [runtime, setRuntime] = useState<GameRuntime | null>(null);

  useEffect(() => {
    const game = new MyGame();
    const rt = new GameRuntime(game, 'My Game');
    
    rt.setCallbacks({
      onStateChange: (state) => console.log('State:', state),
    });

    setRuntime(rt);

    return () => rt.destroy();
  }, []);

  if (!runtime) return <div>Loading...</div>;

  return (
    <div className="relative w-full aspect-video">
      <GameCanvas runtime={runtime} />
      <GameOverlay runtime={runtime} title="My Game" />
    </div>
  );
}
```

## Key Principles

1. **No React state updates per-frame**: All game logic runs inside the runtime loop, not React state
2. **Canvas mounts once**: `GameCanvas` never re-renders during gameplay
3. **State machine driven**: All transitions go through the runtime state machine
4. **Fixed timestep**: Defaults to 60 FPS with fixed delta time for consistent physics
5. **Separation of concerns**: Game logic (Game class) vs UI (React components)

## Performance

- **60 FPS target**: Fixed timestep ensures consistent frame timing
- **No React re-renders**: Canvas and game loop are completely separate from React
- **Efficient updates**: Only overlay UI updates on state changes, not every frame

## Demo

See `app/mini-games/_engine-demo` for a complete working example.

