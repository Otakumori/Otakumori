/**
 * Optimized Particle System
 *
 * Implements spatial partitioning and object pooling for efficient
 * particle management and rendering.
 */

export interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  color: string;
  isDead: boolean;
  layer: number;
}

export interface SpatialGrid {
  cellSize: number;
  width: number;
  height: number;
  cells: Map<string, Particle[]>;
}

export class OptimizedParticleSystem {
  private particles: Particle[] = [];
  private spatialGrid: SpatialGrid;
  private objectPool: Particle[] = [];
  private nextId: number = 1;
  private viewport: { x: number; y: number; width: number; height: number } = {
    x: 0,
    y: 0,
    width: 800,
    height: 600,
  };
  private cellSize: number = 64; // Grid cell size for spatial partitioning

  constructor(cellSize: number = 64) {
    this.cellSize = cellSize;
    this.spatialGrid = {
      cellSize,
      width: 0,
      height: 0,
      cells: new Map(),
    };
  }

  /**
   * Set the viewport for culling
   */
  setViewport(x: number, y: number, width: number, height: number): void {
    this.viewport = { x, y, width, height };
    this.spatialGrid.width = Math.ceil(width / this.cellSize);
    this.spatialGrid.height = Math.ceil(height / this.cellSize);
  }

  /**
   * Add a new particle
   */
  addParticle(config: Partial<Particle>): Particle {
    let particle: Particle;

    // Try to reuse from object pool
    if (this.objectPool.length > 0) {
      particle = this.objectPool.pop()!;
      this.resetParticle(particle, config);
    } else {
      particle = this.createParticle(config);
    }

    this.particles.push(particle);
    return particle;
  }

  /**
   * Update all particles
   */
  update(deltaTime: number): void {
    // Clear spatial grid
    this.spatialGrid.cells.clear();

    // Update particles and build spatial grid
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      if (particle.isDead) {
        this.removeParticle(i);
        continue;
      }

      // Update particle
      this.updateParticle(particle, deltaTime);

      // Add to spatial grid
      this.addToSpatialGrid(particle);
    }
  }

  /**
   * Get particles in viewport (for rendering)
   */
  getVisibleParticles(): Particle[] {
    const visible: Particle[] = [];
    const { x, y, width, height } = this.viewport;

    // Get grid cells that intersect with viewport
    const startX = Math.floor(x / this.cellSize);
    const startY = Math.floor(y / this.cellSize);
    const endX = Math.ceil((x + width) / this.cellSize);
    const endY = Math.ceil((y + height) / this.cellSize);

    for (let cellX = startX; cellX < endX; cellX++) {
      for (let cellY = startY; cellY < endY; cellY++) {
        const key = `${cellX},${cellY}`;
        const cellParticles = this.spatialGrid.cells.get(key);

        if (cellParticles) {
          visible.push(...cellParticles);
        }
      }
    }

    return visible;
  }

  /**
   * Get all particles (for debugging)
   */
  getAllParticles(): Particle[] {
    return [...this.particles];
  }

  /**
   * Clear all particles
   */
  clear(): void {
    // Return all particles to object pool
    for (const particle of this.particles) {
      this.objectPool.push(particle);
    }

    this.particles = [];
    this.spatialGrid.cells.clear();
  }

  /**
   * Get particle count
   */
  getParticleCount(): number {
    return this.particles.length;
  }

  /**
   * Get object pool size
   */
  getPoolSize(): number {
    return this.objectPool.length;
  }

  /**
   * Create a new particle
   */
  private createParticle(config: Partial<Particle>): Particle {
    return {
      id: this.nextId++,
      x: config.x || 0,
      y: config.y || 0,
      z: config.z || 0,
      vx: config.vx || 0,
      vy: config.vy || 0,
      vz: config.vz || 0,
      life: config.life || 1,
      maxLife: config.maxLife || 1,
      size: config.size || 1,
      rotation: config.rotation || 0,
      rotationSpeed: config.rotationSpeed || 0,
      alpha: config.alpha || 1,
      color: config.color || '#ffffff',
      isDead: false,
      layer: config.layer || 0,
    };
  }

  /**
   * Reset a particle for reuse
   */
  private resetParticle(particle: Particle, config: Partial<Particle>): void {
    particle.x = config.x || 0;
    particle.y = config.y || 0;
    particle.z = config.z || 0;
    particle.vx = config.vx || 0;
    particle.vy = config.vy || 0;
    particle.vz = config.vz || 0;
    particle.life = config.life || 1;
    particle.maxLife = config.maxLife || 1;
    particle.size = config.size || 1;
    particle.rotation = config.rotation || 0;
    particle.rotationSpeed = config.rotationSpeed || 0;
    particle.alpha = config.alpha || 1;
    particle.color = config.color || '#ffffff';
    particle.isDead = false;
    particle.layer = config.layer || 0;
  }

  /**
   * Update a single particle
   */
  private updateParticle(particle: Particle, deltaTime: number): void {
    // Update position
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    particle.z += particle.vz * deltaTime;

    // Update rotation
    particle.rotation += particle.rotationSpeed * deltaTime;

    // Update life
    particle.life -= deltaTime;
    if (particle.life <= 0) {
      particle.isDead = true;
    }

    // Update alpha based on life
    particle.alpha = particle.life / particle.maxLife;
  }

  /**
   * Add particle to spatial grid
   */
  private addToSpatialGrid(particle: Particle): void {
    const cellX = Math.floor(particle.x / this.cellSize);
    const cellY = Math.floor(particle.y / this.cellSize);
    const key = `${cellX},${cellY}`;

    if (!this.spatialGrid.cells.has(key)) {
      this.spatialGrid.cells.set(key, []);
    }

    this.spatialGrid.cells.get(key)!.push(particle);
  }

  /**
   * Remove particle at index
   */
  private removeParticle(index: number): void {
    const particle = this.particles[index];
    this.particles.splice(index, 1);

    // Return to object pool
    this.objectPool.push(particle);
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    particleCount: number;
    poolSize: number;
    gridCells: number;
    visibleParticles: number;
  } {
    return {
      particleCount: this.particles.length,
      poolSize: this.objectPool.length,
      gridCells: this.spatialGrid.cells.size,
      visibleParticles: this.getVisibleParticles().length,
    };
  }
}

// Export singleton instance
export const particleSystem = new OptimizedParticleSystem();
