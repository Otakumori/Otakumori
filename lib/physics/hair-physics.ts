/**
 * Hair Physics System using Verlet Integration
 * Provides realistic hair strand simulation for avatars
 */

export interface Vector2 {
  x: number;
  y: number;
}

export class VerletPoint {
  position: Vector2;
  oldPosition: Vector2;
  acceleration: Vector2;
  pinned: boolean;

  constructor(x: number, y: number, pinned = false) {
    this.position = { x, y };
    this.oldPosition = { x, y };
    this.acceleration = { x: 0, y: 0 };
    this.pinned = pinned;
  }

  update(delta: number): void {
    if (this.pinned) return;

    const velocityX = this.position.x - this.oldPosition.x;
    const velocityY = this.position.y - this.oldPosition.y;

    // Apply damping
    const damping = 0.99;

    this.oldPosition.x = this.position.x;
    this.oldPosition.y = this.position.y;

    this.position.x += velocityX * damping + this.acceleration.x * delta * delta;
    this.position.y += velocityY * damping + this.acceleration.y * delta * delta;

    this.acceleration = { x: 0, y: 0 };
  }

  applyForce(force: Vector2): void {
    if (this.pinned) return;
    this.acceleration.x += force.x;
    this.acceleration.y += force.y;
  }
}

export class DistanceConstraint {
  p1: VerletPoint;
  p2: VerletPoint;
  restLength: number;
  stiffness: number;

  constructor(p1: VerletPoint, p2: VerletPoint, stiffness = 1.0) {
    this.p1 = p1;
    this.p2 = p2;
    this.restLength = Math.sqrt(
      Math.pow(p2.position.x - p1.position.x, 2) + Math.pow(p2.position.y - p1.position.y, 2),
    );
    this.stiffness = stiffness;
  }

  solve(): void {
    const dx = this.p2.position.x - this.p1.position.x;
    const dy = this.p2.position.y - this.p1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const difference = (this.restLength - distance) / distance;
    const offsetX = dx * difference * 0.5 * this.stiffness;
    const offsetY = dy * difference * 0.5 * this.stiffness;

    if (!this.p1.pinned) {
      this.p1.position.x -= offsetX;
      this.p1.position.y -= offsetY;
    }

    if (!this.p2.pinned) {
      this.p2.position.x += offsetX;
      this.p2.position.y += offsetY;
    }
  }
}

export class HairStrand {
  points: VerletPoint[];
  constraints: DistanceConstraint[];
  color: string;
  thickness: number;

  constructor(
    startX: number,
    startY: number,
    segmentCount: number,
    segmentLength: number,
    color = '#000000',
    thickness = 2,
  ) {
    this.points = [];
    this.constraints = [];
    this.color = color;
    this.thickness = thickness;

    // Create points
    for (let i = 0; i < segmentCount; i++) {
      const pinned = i === 0; // Pin the root
      const point = new VerletPoint(startX, startY + i * segmentLength, pinned);
      this.points.push(point);
    }

    // Create constraints
    for (let i = 0; i < this.points.length - 1; i++) {
      const constraint = new DistanceConstraint(this.points[i], this.points[i + 1], 0.95);
      this.constraints.push(constraint);
    }
  }

  update(delta: number, gravity: Vector2, wind: Vector2): void {
    // Apply forces
    for (const point of this.points) {
      point.applyForce(gravity);
      point.applyForce(wind);
    }

    // Update points
    for (const point of this.points) {
      point.update(delta);
    }

    // Solve constraints (multiple iterations for stability)
    for (let i = 0; i < 3; i++) {
      for (const constraint of this.constraints) {
        constraint.solve();
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(this.points[0].position.x, this.points[0].position.y);

    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].position.x, this.points[i].position.y);
    }

    ctx.stroke();
  }
}

export class HairPhysicsSystem {
  strands: HairStrand[];
  gravity: Vector2;
  wind: Vector2;
  targetWind: Vector2;
  windSmoothing: number;

  constructor() {
    this.strands = [];
    this.gravity = { x: 0, y: 0.5 };
    this.wind = { x: 0, y: 0 };
    this.targetWind = { x: 0, y: 0 };
    this.windSmoothing = 0.1;
  }

  addStrand(strand: HairStrand): void {
    this.strands.push(strand);
  }

  setWind(x: number, y: number): void {
    this.targetWind = { x, y };
  }

  update(delta: number): void {
    // Smooth wind changes
    this.wind.x += (this.targetWind.x - this.wind.x) * this.windSmoothing;
    this.wind.y += (this.targetWind.y - this.wind.y) * this.windSmoothing;

    // Update all strands
    for (const strand of this.strands) {
      strand.update(delta, this.gravity, this.wind);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const strand of this.strands) {
      strand.render(ctx);
    }
  }

  clear(): void {
    this.strands = [];
  }
}
