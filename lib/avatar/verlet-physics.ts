'use client';

import * as THREE from 'three';

// Types for Verlet physics system
export interface VerletParticle {
  position: THREE.Vector3;
  previousPosition: THREE.Vector3;
  acceleration: THREE.Vector3;
  mass: number;
  radius: number;
  fixed: boolean;
  damping: number;
}

export interface VerletConstraint {
  particleA: VerletParticle;
  particleB: VerletParticle;
  restLength: number;
  stiffness: number;
  damping: number;
  type: 'distance' | 'angle' | 'bend';
}

export interface VerletPhysicsConfig {
  gravity: THREE.Vector3;
  airResistance: number;
  timeStep: number;
  iterations: number;
  enableCollisions: boolean;
  collisionRadius: number;
  groundLevel: number;
  windForce: THREE.Vector3;
  windVariation: number;
}

export interface HairStrand {
  particles: VerletParticle[];
  constraints: VerletConstraint[];
  rootParticle: VerletParticle;
  length: number;
  segments: number;
  thickness: number;
  color: string;
}

export interface ClothMesh {
  particles: VerletParticle[][];
  constraints: VerletConstraint[];
  width: number;
  height: number;
  segmentsX: number;
  segmentsY: number;
  material: THREE.Material;
}

// Verlet Physics Engine
export class VerletPhysicsEngine {
  private particles: VerletParticle[] = [];
  private constraints: VerletConstraint[] = [];
  private config: VerletPhysicsConfig;
  private time: number = 0;
  private windTime: number = 0;

  constructor(config: Partial<VerletPhysicsConfig> = {}) {
    this.config = {
      gravity: new THREE.Vector3(0, -9.82, 0),
      airResistance: 0.99,
      timeStep: 1 / 60,
      iterations: 3,
      enableCollisions: true,
      collisionRadius: 0.1,
      groundLevel: 0,
      windForce: new THREE.Vector3(0, 0, 0),
      windVariation: 0.1,
      ...config,
    };
  }

  // Add particle to simulation
  addParticle(particle: VerletParticle): void {
    this.particles.push(particle);
  }

  // Add constraint to simulation
  addConstraint(constraint: VerletConstraint): void {
    this.constraints.push(constraint);
  }

  // Create hair strand
  createHairStrand(
    rootPosition: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    segments: number,
    thickness: number,
    color: string,
  ): HairStrand {
    const particles: VerletParticle[] = [];
    const constraints: VerletConstraint[] = [];

    // Create particles along the strand
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const position = rootPosition.clone().add(direction.clone().multiplyScalar(length * t));

      const particle: VerletParticle = {
        position: position.clone(),
        previousPosition: position.clone(),
        acceleration: new THREE.Vector3(0, 0, 0),
        mass: 1.0,
        radius: thickness * (1 - t * 0.5), // Taper towards end
        fixed: i === 0, // Root particle is fixed
        damping: 0.99,
      };

      particles.push(particle);
      this.addParticle(particle);
    }

    // Create distance constraints between adjacent particles
    for (let i = 0; i < segments; i++) {
      const constraint: VerletConstraint = {
        particleA: particles[i],
        particleB: particles[i + 1],
        restLength: length / segments,
        stiffness: 0.9,
        damping: 0.99,
        type: 'distance',
      };

      constraints.push(constraint);
      this.addConstraint(constraint);
    }

    // Create bend constraints for every other particle
    for (let i = 1; i < segments - 1; i++) {
      const constraint: VerletConstraint = {
        particleA: particles[i - 1],
        particleB: particles[i + 1],
        restLength: (length / segments) * 2,
        stiffness: 0.5,
        damping: 0.95,
        type: 'bend',
      };

      constraints.push(constraint);
      this.addConstraint(constraint);
    }

    return {
      particles,
      constraints,
      rootParticle: particles[0],
      length,
      segments,
      thickness,
      color,
    };
  }

  // Create cloth mesh
  createClothMesh(
    width: number,
    height: number,
    segmentsX: number,
    segmentsY: number,
    material: THREE.Material,
  ): ClothMesh {
    const particles: VerletParticle[][] = [];
    const constraints: VerletConstraint[] = [];

    // Create particle grid
    for (let y = 0; y <= segmentsY; y++) {
      const row: VerletParticle[] = [];
      for (let x = 0; x <= segmentsX; x++) {
        const position = new THREE.Vector3(
          (x / segmentsX - 0.5) * width,
          (y / segmentsY - 0.5) * height,
          0,
        );

        const particle: VerletParticle = {
          position: position.clone(),
          previousPosition: position.clone(),
          acceleration: new THREE.Vector3(0, 0, 0),
          mass: 1.0,
          radius: 0.05,
          fixed: y === 0, // Top row is fixed
          damping: 0.99,
        };

        row.push(particle);
        this.addParticle(particle);
      }
      particles.push(row);
    }

    // Create distance constraints
    for (let y = 0; y <= segmentsY; y++) {
      for (let x = 0; x <= segmentsX; x++) {
        const particle = particles[y][x];

        // Horizontal constraints
        if (x < segmentsX) {
          const constraint: VerletConstraint = {
            particleA: particle,
            particleB: particles[y][x + 1],
            restLength: width / segmentsX,
            stiffness: 0.9,
            damping: 0.99,
            type: 'distance',
          };
          constraints.push(constraint);
          this.addConstraint(constraint);
        }

        // Vertical constraints
        if (y < segmentsY) {
          const constraint: VerletConstraint = {
            particleA: particle,
            particleB: particles[y + 1][x],
            restLength: height / segmentsY,
            stiffness: 0.9,
            damping: 0.99,
            type: 'distance',
          };
          constraints.push(constraint);
          this.addConstraint(constraint);
        }

        // Diagonal constraints for stability
        if (x < segmentsX && y < segmentsY) {
          const constraint: VerletConstraint = {
            particleA: particle,
            particleB: particles[y + 1][x + 1],
            restLength: Math.sqrt((width / segmentsX) ** 2 + (height / segmentsY) ** 2),
            stiffness: 0.7,
            damping: 0.99,
            type: 'distance',
          };
          constraints.push(constraint);
          this.addConstraint(constraint);
        }
      }
    }

    return {
      particles,
      constraints,
      width,
      height,
      segmentsX,
      segmentsY,
      material,
    };
  }

  // Update physics simulation
  update(deltaTime: number): void {
    this.time += deltaTime;
    this.windTime += deltaTime;

    // Update wind force
    this.updateWindForce();

    // Apply forces
    this.applyForces();

    // Integrate particles
    this.integrateParticles(deltaTime);

    // Solve constraints
    this.solveConstraints();

    // Handle collisions
    if (this.config.enableCollisions) {
      this.handleCollisions();
    }
  }

  // Apply forces to particles
  private applyForces(): void {
    for (const particle of this.particles) {
      if (particle.fixed) continue;

      // Reset acceleration
      particle.acceleration.set(0, 0, 0);

      // Apply gravity
      particle.acceleration.add(this.config.gravity);

      // Apply wind force
      const windForce = this.config.windForce.clone();
      windForce.x += Math.sin(this.windTime * 2) * this.config.windVariation;
      windForce.z += Math.cos(this.windTime * 1.5) * this.config.windVariation;
      particle.acceleration.add(windForce);

      // Apply air resistance
      particle.acceleration.multiplyScalar(this.config.airResistance);
    }
  }

  // Integrate particle positions
  private integrateParticles(deltaTime: number): void {
    for (const particle of this.particles) {
      if (particle.fixed) continue;

      // Store current position
      const currentPosition = particle.position.clone();

      // Verlet integration
      particle.position.multiplyScalar(2).sub(particle.previousPosition);
      particle.position.add(particle.acceleration.clone().multiplyScalar(deltaTime * deltaTime));

      // Apply damping
      particle.position.lerp(particle.previousPosition, 1 - particle.damping);

      // Update previous position
      particle.previousPosition.copy(currentPosition);
    }
  }

  // Solve constraints
  private solveConstraints(): void {
    for (let i = 0; i < this.config.iterations; i++) {
      for (const constraint of this.constraints) {
        this.solveConstraint(constraint);
      }
    }
  }

  // Solve individual constraint
  private solveConstraint(constraint: VerletConstraint): void {
    const { particleA, particleB, restLength, stiffness, damping } = constraint;

    if (particleA.fixed && particleB.fixed) return;

    const delta = particleB.position.clone().sub(particleA.position);
    const distance = delta.length();

    if (distance === 0) return;

    const difference = (distance - restLength) / distance;
    const correction = delta.multiplyScalar(difference * stiffness);

    if (!particleA.fixed && !particleB.fixed) {
      const massRatio = particleB.mass / (particleA.mass + particleB.mass);
      particleA.position.add(correction.clone().multiplyScalar(massRatio));
      particleB.position.sub(correction.clone().multiplyScalar(1 - massRatio));
    } else if (particleA.fixed) {
      particleB.position.sub(correction);
    } else {
      particleA.position.add(correction);
    }
  }

  // Handle collisions
  private handleCollisions(): void {
    // Ground collision
    for (const particle of this.particles) {
      if (particle.position.y < this.config.groundLevel + particle.radius) {
        particle.position.y = this.config.groundLevel + particle.radius;
        particle.previousPosition.y = particle.position.y;
      }
    }

    // Particle-particle collisions
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const particleA = this.particles[i];
        const particleB = this.particles[j];

        const delta = particleB.position.clone().sub(particleA.position);
        const distance = delta.length();
        const minDistance = particleA.radius + particleB.radius;

        if (distance < minDistance && distance > 0) {
          const correction = delta.normalize().multiplyScalar((minDistance - distance) * 0.5);

          if (!particleA.fixed) {
            particleA.position.sub(correction);
          }
          if (!particleB.fixed) {
            particleB.position.add(correction);
          }
        }
      }
    }
  }

  // Update wind force
  private updateWindForce(): void {
    // Simple wind simulation
    this.config.windForce.set(
      Math.sin(this.windTime * 0.5) * 2,
      Math.cos(this.windTime * 0.3) * 0.5,
      Math.sin(this.windTime * 0.7) * 1.5,
    );
  }

  // Get particle positions for rendering
  getParticlePositions(): THREE.Vector3[] {
    return this.particles.map((particle) => particle.position.clone());
  }

  // Get constraint lines for debugging
  getConstraintLines(): THREE.Line3[] {
    return this.constraints.map(
      (constraint) => new THREE.Line3(constraint.particleA.position, constraint.particleB.position),
    );
  }

  // Clear all particles and constraints
  clear(): void {
    this.particles = [];
    this.constraints = [];
  }

  // Get simulation statistics
  getStats(): { particleCount: number; constraintCount: number; time: number } {
    return {
      particleCount: this.particles.length,
      constraintCount: this.constraints.length,
      time: this.time,
    };
  }
}

// Hair physics system
export class HairPhysicsSystem {
  private engine: VerletPhysicsEngine;
  private strands: HairStrand[] = [];
  private headPosition: THREE.Vector3 = new THREE.Vector3(0, 1.6, 0);
  private headRadius: number = 0.15;

  constructor(engine: VerletPhysicsEngine) {
    this.engine = engine;
  }

  // Add hair strand
  addHairStrand(
    rootPosition: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    segments: number,
    thickness: number,
    color: string,
  ): HairStrand {
    const strand = this.engine.createHairStrand(
      rootPosition,
      direction,
      length,
      segments,
      thickness,
      color,
    );

    this.strands.push(strand);
    return strand;
  }

  // Update hair physics
  update(deltaTime: number): void {
    // Update head collision
    this.updateHeadCollision();

    // Update engine
    this.engine.update(deltaTime);
  }

  // Update head collision
  private updateHeadCollision(): void {
    for (const strand of this.strands) {
      for (const particle of strand.particles) {
        if (particle.fixed) continue;

        const delta = particle.position.clone().sub(this.headPosition);
        const distance = delta.length();

        if (distance < this.headRadius + particle.radius) {
          const correction = delta
            .normalize()
            .multiplyScalar(this.headRadius + particle.radius - distance);
          particle.position.add(correction);
        }
      }
    }
  }

  // Get hair geometry for rendering
  getHairGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    let vertexIndex = 0;

    for (const strand of this.strands) {
      const strandPositions: number[] = [];
      const strandColors: number[] = [];

      for (const particle of strand.particles) {
        strandPositions.push(particle.position.x, particle.position.y, particle.position.z);

        const color = new THREE.Color(strand.color);
        strandColors.push(color.r, color.g, color.b);
      }

      positions.push(...strandPositions);
      colors.push(...strandColors);

      // Create line indices
      for (let i = 0; i < strand.particles.length - 1; i++) {
        indices.push(vertexIndex + i, vertexIndex + i + 1);
      }

      vertexIndex += strand.particles.length;
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);

    return geometry;
  }

  // Get strand count
  getStrandCount(): number {
    return this.strands.length;
  }
}

// Cloth physics system
export class ClothPhysicsSystem {
  private engine: VerletPhysicsEngine;
  private clothMeshes: ClothMesh[] = [];

  constructor(engine: VerletPhysicsEngine) {
    this.engine = engine;
  }

  // Add cloth mesh
  addClothMesh(
    width: number,
    height: number,
    segmentsX: number,
    segmentsY: number,
    material: THREE.Material,
  ): ClothMesh {
    const cloth = this.engine.createClothMesh(width, height, segmentsX, segmentsY, material);

    this.clothMeshes.push(cloth);
    return cloth;
  }

  // Update cloth physics
  update(deltaTime: number): void {
    this.engine.update(deltaTime);
  }

  // Get cloth geometry for rendering
  getClothGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    let vertexIndex = 0;

    for (const cloth of this.clothMeshes) {
      const clothPositions: number[] = [];
      const clothUvs: number[] = [];

      for (let y = 0; y <= cloth.segmentsY; y++) {
        for (let x = 0; x <= cloth.segmentsX; x++) {
          const particle = cloth.particles[y][x];
          clothPositions.push(particle.position.x, particle.position.y, particle.position.z);
          clothUvs.push(x / cloth.segmentsX, y / cloth.segmentsY);
        }
      }

      positions.push(...clothPositions);
      uvs.push(...clothUvs);

      // Create triangle indices
      for (let y = 0; y < cloth.segmentsY; y++) {
        for (let x = 0; x < cloth.segmentsX; x++) {
          const a = vertexIndex + y * (cloth.segmentsX + 1) + x;
          const b = vertexIndex + (y + 1) * (cloth.segmentsX + 1) + x;
          const c = vertexIndex + y * (cloth.segmentsX + 1) + x + 1;
          const d = vertexIndex + (y + 1) * (cloth.segmentsX + 1) + x + 1;

          // First triangle
          indices.push(a, b, c);
          // Second triangle
          indices.push(b, d, c);
        }
      }

      vertexIndex += (cloth.segmentsX + 1) * (cloth.segmentsY + 1);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    return geometry;
  }

  // Get cloth count
  getClothCount(): number {
    return this.clothMeshes.length;
  }
}
