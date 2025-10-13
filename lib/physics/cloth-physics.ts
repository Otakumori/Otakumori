/**
 * Cloth Physics System using Spring-Mass Model
 * Provides realistic cloth/fabric simulation for avatar accessories
 */

import { type Vector2, VerletPoint, DistanceConstraint } from './hair-physics';

export class ClothPoint extends VerletPoint {
  mass: number;
  fixed: boolean;

  constructor(x: number, y: number, mass = 1.0, fixed = false) {
    super(x, y, fixed);
    this.mass = mass;
    this.fixed = fixed;
  }

  override update(delta: number): void {
    if (this.fixed) return;
    super.update(delta);
  }
}

export class ClothMesh {
  points: ClothPoint[][];
  constraints: DistanceConstraint[];
  width: number;
  height: number;
  color: string;
  opacity: number;

  constructor(
    startX: number,
    startY: number,
    width: number,
    height: number,
    cols: number,
    rows: number,
    color = '#FFFFFF',
    opacity = 0.8,
  ) {
    this.width = width;
    this.height = height;
    this.color = color;
    this.opacity = opacity;
    this.points = [];
    this.constraints = [];

    const dx = width / (cols - 1);
    const dy = height / (rows - 1);

    // Create point grid
    for (let y = 0; y < rows; y++) {
      const row: ClothPoint[] = [];
      for (let x = 0; x < cols; x++) {
        const px = startX + x * dx;
        const py = startY + y * dy;
        const fixed = y === 0; // Fix top row
        const point = new ClothPoint(px, py, 1.0, fixed);
        row.push(point);
      }
      this.points.push(row);
    }

    // Create structural constraints (vertical and horizontal)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (x < cols - 1) {
          // Horizontal
          const constraint = new DistanceConstraint(this.points[y][x], this.points[y][x + 1], 0.98);
          this.constraints.push(constraint);
        }
        if (y < rows - 1) {
          // Vertical
          const constraint = new DistanceConstraint(this.points[y][x], this.points[y + 1][x], 0.98);
          this.constraints.push(constraint);
        }
      }
    }

    // Create shear constraints (diagonals for better stability)
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols - 1; x++) {
        // Diagonal 1
        const constraint1 = new DistanceConstraint(
          this.points[y][x],
          this.points[y + 1][x + 1],
          0.95,
        );
        this.constraints.push(constraint1);

        // Diagonal 2
        const constraint2 = new DistanceConstraint(
          this.points[y][x + 1],
          this.points[y + 1][x],
          0.95,
        );
        this.constraints.push(constraint2);
      }
    }
  }

  update(delta: number, gravity: Vector2, wind: Vector2): void {
    // Apply forces to all points
    for (const row of this.points) {
      for (const point of row) {
        point.applyForce(gravity);
        point.applyForce(wind);
      }
    }

    // Update points
    for (const row of this.points) {
      for (const point of row) {
        point.update(delta);
      }
    }

    // Solve constraints (multiple iterations)
    for (let i = 0; i < 5; i++) {
      for (const constraint of this.constraints) {
        constraint.solve();
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;

    // Draw cloth as triangles for proper rendering
    for (let y = 0; y < this.points.length - 1; y++) {
      for (let x = 0; x < this.points[y].length - 1; x++) {
        const p1 = this.points[y][x];
        const p2 = this.points[y][x + 1];
        const p3 = this.points[y + 1][x];
        const p4 = this.points[y + 1][x + 1];

        // First triangle
        ctx.beginPath();
        ctx.moveTo(p1.position.x, p1.position.y);
        ctx.lineTo(p2.position.x, p2.position.y);
        ctx.lineTo(p3.position.x, p3.position.y);
        ctx.closePath();
        ctx.fill();

        // Second triangle
        ctx.beginPath();
        ctx.moveTo(p2.position.x, p2.position.y);
        ctx.lineTo(p4.position.x, p4.position.y);
        ctx.lineTo(p3.position.x, p3.position.y);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1.0;
  }

  // Collision detection with circular collider (avatar head/body)
  solveCollision(circleX: number, circleY: number, radius: number): void {
    for (const row of this.points) {
      for (const point of row) {
        if (point.fixed) continue;

        const dx = point.position.x - circleX;
        const dy = point.position.y - circleY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < radius) {
          const angle = Math.atan2(dy, dx);
          point.position.x = circleX + Math.cos(angle) * radius;
          point.position.y = circleY + Math.sin(angle) * radius;
        }
      }
    }
  }
}

export class ClothPhysicsSystem {
  meshes: ClothMesh[];
  gravity: Vector2;
  wind: Vector2;
  colliders: Array<{ x: number; y: number; radius: number }>;

  constructor() {
    this.meshes = [];
    this.gravity = { x: 0, y: 0.8 };
    this.wind = { x: 0, y: 0 };
    this.colliders = [];
  }

  addMesh(mesh: ClothMesh): void {
    this.meshes.push(mesh);
  }

  addCollider(x: number, y: number, radius: number): void {
    this.colliders.push({ x, y, radius });
  }

  setWind(x: number, y: number): void {
    this.wind = { x, y };
  }

  update(delta: number): void {
    for (const mesh of this.meshes) {
      mesh.update(delta, this.gravity, this.wind);

      // Apply collision detection
      for (const collider of this.colliders) {
        mesh.solveCollision(collider.x, collider.y, collider.radius);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const mesh of this.meshes) {
      mesh.render(ctx);
    }
  }

  clear(): void {
    this.meshes = [];
    this.colliders = [];
  }
}
