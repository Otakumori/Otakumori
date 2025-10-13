/**
 * Advanced Petal Physics Engine
 * Real-time physics simulation with wind, collisions, and particle interactions
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface PhysicsPetal {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  rotation: number;
  angularVelocity: number;
  scale: number;
  mass: number;
  drag: number;
  bounce: number;
  lifetime: number;
  age: number;
  color: string;
  trail: Vector2D[];
  isColliding: boolean;
  energy: number;
}

export interface WindField {
  strength: number;
  direction: Vector2D;
  turbulence: number;
  gustiness: number;
  noiseOffset: number;
}

export interface CollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'bouncy' | 'absorb';
  restitution: number;
}

export class PetalPhysicsEngine {
  private petals: PhysicsPetal[] = [];
  private windField: WindField;
  private collisionBoxes: CollisionBox[] = [];
  private gravity: Vector2D = { x: 0, y: 0.1 };
  private bounds: { width: number; height: number };
  private time: number = 0;
  private maxPetals: number;
  private mousePosition: Vector2D = { x: 0, y: 0 };
  private mouseInfluence: number = 0;

  constructor(bounds: { width: number; height: number }, maxPetals: number = 100) {
    this.bounds = bounds;
    this.maxPetals = maxPetals;
    this.windField = {
      strength: 0.02,
      direction: { x: 1, y: 0 },
      turbulence: 0.01,
      gustiness: 0.5,
      noiseOffset: 0,
    };
  }

  // Perlin noise implementation for realistic wind patterns
  private noise(x: number, y: number, z: number): number {
    const p = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69,
      142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219,
      203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
      74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230,
      220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209,
      76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198,
      173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
      207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
      154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79,
      113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
      191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29,
      24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
    ];

    const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (t: number, a: number, b: number) => a + t * (b - a);
    const grad = (hash: number, x: number, y: number, z: number) => {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = fade(x);
    const v = fade(y);
    const w = fade(z);

    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;

    return lerp(
      w,
      lerp(
        v,
        lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
        lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z)),
      ),
      lerp(
        v,
        lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
        lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1)),
      ),
    );
  }

  // Calculate wind force at a given position
  private getWindForce(position: Vector2D): Vector2D {
    const noiseScale = 0.01;
    const timeScale = 0.001;

    // Base wind
    const baseWind = {
      x: this.windField.direction.x * this.windField.strength,
      y: this.windField.direction.y * this.windField.strength,
    };

    // Turbulence using Perlin noise
    const turbulenceX =
      this.noise(position.x * noiseScale, position.y * noiseScale, this.time * timeScale) *
      this.windField.turbulence;
    const turbulenceY =
      this.noise(
        position.x * noiseScale + 100,
        position.y * noiseScale + 100,
        this.time * timeScale,
      ) * this.windField.turbulence;

    // Gustiness (periodic stronger winds)
    const gustPhase = Math.sin(this.time * 0.003) * 0.5 + 0.5;
    const gustMultiplier = 1 + gustPhase * this.windField.gustiness;

    // Mouse influence (creates wind vortex around cursor)
    const mouseDistance = Math.sqrt(
      Math.pow(position.x - this.mousePosition.x, 2) +
        Math.pow(position.y - this.mousePosition.y, 2),
    );
    const mouseForce = Math.max(0, 1 - mouseDistance / 100) * this.mouseInfluence;
    const mouseDirection = {
      x: (position.x - this.mousePosition.x) / mouseDistance || 0,
      y: (position.y - this.mousePosition.y) / mouseDistance || 0,
    };

    return {
      x: (baseWind.x + turbulenceX) * gustMultiplier + mouseDirection.x * mouseForce,
      y: (baseWind.y + turbulenceY) * gustMultiplier + mouseDirection.y * mouseForce,
    };
  }

  // Check collision with boundaries and obstacles
  private checkCollisions(petal: PhysicsPetal): void {
    // Boundary collisions
    if (petal.position.x <= 0 || petal.position.x >= this.bounds.width) {
      petal.velocity.x *= -petal.bounce;
      petal.position.x = Math.max(0, Math.min(this.bounds.width, petal.position.x));
      petal.isColliding = true;
    }

    if (petal.position.y <= 0 || petal.position.y >= this.bounds.height) {
      petal.velocity.y *= -petal.bounce;
      petal.position.y = Math.max(0, Math.min(this.bounds.height, petal.position.y));
      petal.isColliding = true;
    }

    // Obstacle collisions
    for (const box of this.collisionBoxes) {
      if (
        petal.position.x >= box.x &&
        petal.position.x <= box.x + box.width &&
        petal.position.y >= box.y &&
        petal.position.y <= box.y + box.height
      ) {
        switch (box.type) {
          case 'bouncy':
            // Determine collision side and bounce accordingly
            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            const deltaX = petal.position.x - centerX;
            const deltaY = petal.position.y - centerY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              petal.velocity.x *= -box.restitution;
            } else {
              petal.velocity.y *= -box.restitution;
            }
            petal.isColliding = true;
            break;

          case 'absorb':
            petal.energy *= 0.5;
            petal.velocity.x *= 0.1;
            petal.velocity.y *= 0.1;
            break;

          case 'solid':
            // Push petal out of solid object
            const solidCenterX = box.x + box.width / 2;
            const solidCenterY = box.y + box.height / 2;
            const solidDeltaX = petal.position.x - solidCenterX;
            const solidDeltaY = petal.position.y - solidCenterY;

            if (Math.abs(solidDeltaX) > Math.abs(solidDeltaY)) {
              petal.position.x = solidDeltaX > 0 ? box.x + box.width : box.x;
              petal.velocity.x = 0;
            } else {
              petal.position.y = solidDeltaY > 0 ? box.y + box.height : box.y;
              petal.velocity.y = 0;
            }
            break;
        }
      }
    }
  }

  // Particle-to-particle interactions
  private updateParticleInteractions(): void {
    for (let i = 0; i < this.petals.length; i++) {
      for (let j = i + 1; j < this.petals.length; j++) {
        const petal1 = this.petals[i];
        const petal2 = this.petals[j];

        const dx = petal2.position.x - petal1.position.x;
        const dy = petal2.position.y - petal1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Collision detection (simple radius check)
        const minDistance = (petal1.scale + petal2.scale) * 10;
        if (distance < minDistance && distance > 0) {
          // Collision response
          const overlap = minDistance - distance;
          const separationX = (dx / distance) * overlap * 0.5;
          const separationY = (dy / distance) * overlap * 0.5;

          petal1.position.x -= separationX;
          petal1.position.y -= separationY;
          petal2.position.x += separationX;
          petal2.position.y += separationY;

          // Velocity exchange (simplified elastic collision)
          const relativeVelocityX = petal2.velocity.x - petal1.velocity.x;
          const relativeVelocityY = petal2.velocity.y - petal1.velocity.y;

          const impulse = 0.1; // Collision strength
          petal1.velocity.x += relativeVelocityX * impulse;
          petal1.velocity.y += relativeVelocityY * impulse;
          petal2.velocity.x -= relativeVelocityX * impulse;
          petal2.velocity.y -= relativeVelocityY * impulse;

          petal1.isColliding = true;
          petal2.isColliding = true;
        }
      }
    }
  }

  // Spawn a new petal with realistic properties
  public spawnPetal(x: number, y: number): void {
    if (this.petals.length >= this.maxPetals) return;

    const colors = ['#FFB7C5', '#FF69B4', '#FFC0CB', '#FF1493', '#FFE4E1'];

    const petal: PhysicsPetal = {
      id: `petal-${Date.now()}-${Math.random()}`,
      position: { x, y },
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 0.5,
      },
      acceleration: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      angularVelocity: (Math.random() - 0.5) * 0.1,
      scale: 0.5 + Math.random() * 0.5,
      mass: 0.8 + Math.random() * 0.4,
      drag: 0.98,
      bounce: 0.3 + Math.random() * 0.4,
      lifetime: 10000 + Math.random() * 5000,
      age: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      trail: [],
      isColliding: false,
      energy: 1.0,
    };

    this.petals.push(petal);
  }

  // Update physics simulation
  public update(deltaTime: number): void {
    this.time += deltaTime;

    for (let i = this.petals.length - 1; i >= 0; i--) {
      const petal = this.petals[i];
      petal.age += deltaTime;
      petal.isColliding = false;

      // Remove old petals
      if (petal.age > petal.lifetime || petal.energy < 0.01) {
        this.petals.splice(i, 1);
        continue;
      }

      // Reset acceleration
      petal.acceleration = { x: 0, y: 0 };

      // Apply forces
      const windForce = this.getWindForce(petal.position);
      petal.acceleration.x += windForce.x / petal.mass;
      petal.acceleration.y += windForce.y / petal.mass;

      // Apply gravity
      petal.acceleration.x += this.gravity.x;
      petal.acceleration.y += this.gravity.y;

      // Update velocity
      petal.velocity.x += petal.acceleration.x * deltaTime;
      petal.velocity.y += petal.acceleration.y * deltaTime;

      // Apply drag
      petal.velocity.x *= petal.drag;
      petal.velocity.y *= petal.drag;

      // Update position
      petal.position.x += petal.velocity.x * deltaTime;
      petal.position.y += petal.velocity.y * deltaTime;

      // Update rotation
      petal.rotation += petal.angularVelocity * deltaTime;

      // Update trail
      if (petal.trail.length > 10) {
        petal.trail.shift();
      }
      petal.trail.push({ x: petal.position.x, y: petal.position.y });

      // Check collisions
      this.checkCollisions(petal);

      // Energy decay
      petal.energy *= 0.9999;
    }

    // Update particle interactions
    this.updateParticleInteractions();
  }

  // Set mouse position for mouse influence
  public setMousePosition(x: number, y: number, influence: number = 0.1): void {
    this.mousePosition = { x, y };
    this.mouseInfluence = influence;
  }

  // Set wind parameters
  public setWind(strength: number, direction: Vector2D, turbulence: number = 0.01): void {
    this.windField.strength = strength;
    this.windField.direction = direction;
    this.windField.turbulence = turbulence;
  }

  // Add collision box
  public addCollisionBox(box: CollisionBox): void {
    this.collisionBoxes.push(box);
  }

  // Clear collision boxes
  public clearCollisionBoxes(): void {
    this.collisionBoxes = [];
  }

  // Get current petals
  public getPetals(): PhysicsPetal[] {
    return this.petals;
  }

  // Clear all petals
  public clearPetals(): void {
    this.petals = [];
  }

  // Set bounds
  public setBounds(width: number, height: number): void {
    this.bounds = { width, height };
  }
}
