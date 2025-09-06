// Animation utilities for both interactive and aesthetic petals
export interface WindState {
  direction: number; // degrees
  speed: number; // base speed
  gustStrength: number; // 0-1
  gustDirection: number; // degrees
}

export interface PetalPhysics {
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  rotation: number;
  rotationSpeed: number;
  swayAmplitude: number;
  swayFrequency: number;
  flipAngle: number;
  flipSpeed: number;
}

export class WindController {
  private wind: WindState = {
    direction: 45, // degrees (45 = diagonal down-right)
    speed: 30, // px/sec
    gustStrength: 0,
    gustDirection: 45
  };

  private gustTimer = 0;
  private gustInterval = 3000 + Math.random() * 3000; // 3-6 seconds

  update(deltaTime: number): WindState {
    this.gustTimer += deltaTime;

    // Trigger gust
    if (this.gustTimer >= this.gustInterval) {
      this.triggerGust();
      this.gustTimer = 0;
      this.gustInterval = 3000 + Math.random() * 3000;
    }

    // Decay gust strength
    this.wind.gustStrength *= 0.95;

    return { ...this.wind };
  }

  private triggerGust() {
    this.wind.gustStrength = 0.5 + Math.random() * 0.5; // 0.5-1.0
    this.wind.gustDirection = this.wind.direction + (Math.random() - 0.5) * 60; // ±30 degrees
  }

  // Calculate wind effect on petal
  applyWind(physics: PetalPhysics, wind: WindState, deltaTime: number): PetalPhysics {
    const gustMultiplier = 1 + wind.gustStrength;
    const windAngle = wind.direction + wind.gustStrength * (wind.gustDirection - wind.direction);
    
    const windX = Math.cos((windAngle * Math.PI) / 180) * wind.speed * gustMultiplier;
    const windY = Math.sin((windAngle * Math.PI) / 180) * wind.speed * gustMultiplier;

    return {
      ...physics,
      vx: windX + Math.sin(physics.y * 0.01) * physics.swayAmplitude * 0.1,
      vy: windY + 50 + Math.random() * 20, // base fall speed + variance
      rotationSpeed: physics.rotationSpeed + wind.gustStrength * 0.5,
      flipSpeed: physics.flipSpeed + wind.gustStrength * 0.3
    };
  }
}

export class PetalSpawner {
  private canopyBounds = {
    x: 0,
    y: 0,
    width: 400, // Adjust based on your canopy image
    height: 300
  };

  setCanopyBounds(bounds: { x: number; y: number; width: number; height: number }) {
    this.canopyBounds = bounds;
  }

  spawnPetal(): { x: number; y: number; physics: PetalPhysics } {
    const x = this.canopyBounds.x + Math.random() * this.canopyBounds.width;
    const y = this.canopyBounds.y + Math.random() * this.canopyBounds.height;

    return {
      x,
      y,
      physics: {
        x,
        y,
        vx: 0,
        vy: 0,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        swayAmplitude: 10 + Math.random() * 10,
        swayFrequency: 0.5 + Math.random() * 0.5,
        flipAngle: 0,
        flipSpeed: (Math.random() - 0.5) * 0.2
      }
    };
  }
}

// Utility functions
export function createPetalElement(
  x: number, 
  y: number, 
  color: string = '#F7BFD3',
  interactive: boolean = false
): HTMLDivElement {
  const petal = document.createElement('div');
  petal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 24px;
    height: 24px;
    background: radial-gradient(circle at 30% 30%, ${color}, ${color} 70%, rgba(0,0,0,0) 100%);
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    pointer-events: ${interactive ? 'auto' : 'none'};
    cursor: ${interactive ? 'pointer' : 'default'};
    z-index: 50;
    transform: translate3d(${x}px, ${y}px, 0);
  `;
  return petal;
}

export function updatePetalTransform(
  element: HTMLDivElement, 
  physics: PetalPhysics
): void {
  element.style.transform = `
    translate3d(${physics.x}px, ${physics.y}px, 0)
    rotateZ(${physics.rotation}deg)
    rotateY(${physics.flipAngle}deg)
  `;
}

export function isPetalOffScreen(physics: PetalPhysics, screenHeight: number): boolean {
  return physics.y > screenHeight + 50;
}

export function resetPetalToCanopy(
  physics: PetalPhysics, 
  spawnX: number, 
  spawnY: number
): PetalPhysics {
  return {
    ...physics,
    x: spawnX,
    y: spawnY,
    rotation: Math.random() * 360,
    flipAngle: 0
  };
}
