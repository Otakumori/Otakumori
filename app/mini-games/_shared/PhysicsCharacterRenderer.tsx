/**
 * Physics Character Renderer
 *
 * Advanced character rendering system with:
 * - R18 physics (jiggle, movement reactions, impacts)
 * - Cel-shading (90s anime style with hard-edged shadows)
 * - 90s anime aesthetics (large expressive eyes, eyelashes, multiple shine layers)
 * - Rim lighting and bloom effects
 * - Modern polish (smooth gradients, particle effects)
 */

'use client';

// 2D Vector for canvas physics (adapted from THREE.Vector3)
interface Vector2D {
  x: number;
  y: number;
}

// Physics particle for 2D canvas rendering
interface PhysicsParticle {
  position: Vector2D;
  previousPosition: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  mass: number;
  radius: number;
  fixed: boolean;
  damping: number;
}

// Physics constraint
interface PhysicsConstraint {
  particleA: PhysicsParticle;
  particleB: PhysicsParticle;
  restLength: number;
  stiffness: number;
  damping: number;
}

// Body part configuration
interface BodyPart {
  particles: PhysicsParticle[];
  constraints: PhysicsConstraint[];
  centerX: number;
  centerY: number;
  baseRadius: number;
  color: string;
  highlightColor: string;
  shadowColor: string;
}

// R18 Physics Configuration
export interface R18PhysicsConfig {
  enabled: boolean;
  jiggleFrequency: number; // Hz
  jiggleAmplitude: number; // pixels
  movementSensitivity: number; // 0-1, how much movement triggers physics
  impactMultiplier: number; // How much impacts affect physics
  damping: number; // 0-1, higher = less bouncy
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

// Character Visual Configuration
export interface CharacterVisualConfig {
  celShading: boolean;
  rimLighting: boolean;
  bloom: boolean;
  eyeShineLayers: number; // 1-3 for 90s anime effect
  outlineWidth: number; // Bold outlines for 90s anime
  eyelashes: boolean;
  particleEffects: boolean;
}

// Physics Presets
export const R18_PHYSICS_PRESETS: Record<string, R18PhysicsConfig> = {
  succubus: {
    enabled: true,
    jiggleFrequency: 8.0,
    jiggleAmplitude: 4.0,
    movementSensitivity: 0.8,
    impactMultiplier: 1.5,
    damping: 0.85,
    quality: 'high',
  },
  demon_lord: {
    enabled: true,
    jiggleFrequency: 6.0,
    jiggleAmplitude: 3.0,
    movementSensitivity: 0.6,
    impactMultiplier: 1.2,
    damping: 0.9,
    quality: 'high',
  },
  player: {
    enabled: true,
    jiggleFrequency: 5.0,
    jiggleAmplitude: 2.0,
    movementSensitivity: 0.5,
    impactMultiplier: 1.0,
    damping: 0.88,
    quality: 'medium',
  },
  default: {
    enabled: true,
    jiggleFrequency: 6.0,
    jiggleAmplitude: 3.0,
    movementSensitivity: 0.6,
    impactMultiplier: 1.0,
    damping: 0.87,
    quality: 'medium',
  },
};

// Visual Presets
export const CHARACTER_VISUAL_PRESETS: Record<string, CharacterVisualConfig> = {
  succubus: {
    celShading: true,
    rimLighting: true,
    bloom: true,
    eyeShineLayers: 3,
    outlineWidth: 2,
    eyelashes: true,
    particleEffects: true,
  },
  demon_lord: {
    celShading: true,
    rimLighting: true,
    bloom: true,
    eyeShineLayers: 2,
    outlineWidth: 2.5,
    eyelashes: false,
    particleEffects: true,
  },
  player: {
    celShading: true,
    rimLighting: true,
    bloom: false,
    eyeShineLayers: 2,
    outlineWidth: 2,
    eyelashes: false,
    particleEffects: false,
  },
  default: {
    celShading: true,
    rimLighting: true,
    bloom: false,
    eyeShineLayers: 2,
    outlineWidth: 2,
    eyelashes: false,
    particleEffects: false,
  },
};

// Main Physics Character Renderer Class
export class PhysicsCharacterRenderer {
  protected physicsEngine: {
    particles: PhysicsParticle[];
    constraints: PhysicsConstraint[];
    update: (deltaTime: number) => void;
  };
  protected config: R18PhysicsConfig;
  protected visualConfig: CharacterVisualConfig;
  protected ctx: CanvasRenderingContext2D;

  // Body parts
  protected chest: BodyPart | null = null;
  protected hips: BodyPart | null = null;
  protected hair: BodyPart[] = [];
  protected thighs: BodyPart[] = [];
  protected arms: BodyPart[] = [];

  // Character properties
  protected characterType: string;
  protected baseX: number = 0;
  protected baseY: number = 0;
  protected facing: 'left' | 'right' = 'right';
  protected scale: number = 1.0;

  // Physics state
  protected lastVelocity: Vector2D = { x: 0, y: 0 };
  protected lastPosition: Vector2D = { x: 0, y: 0 };
  protected time: number = 0;

  // Impact queue
  protected impacts: Array<{ force: Vector2D; part: string; time: number }> = [];

  constructor(
    ctx: CanvasRenderingContext2D,
    characterType: string = 'default',
    physicsConfig?: Partial<R18PhysicsConfig>,
    visualConfig?: Partial<CharacterVisualConfig>,
  ) {
    this.ctx = ctx;
    this.characterType = characterType;

    // Merge configs with presets
    this.config = {
      ...(R18_PHYSICS_PRESETS[characterType] || R18_PHYSICS_PRESETS.default),
      ...physicsConfig,
    };

    this.visualConfig = {
      ...(CHARACTER_VISUAL_PRESETS[characterType] || CHARACTER_VISUAL_PRESETS.default),
      ...visualConfig,
    };

    // Initialize physics engine
    this.physicsEngine = {
      particles: [],
      constraints: [],
      update: this.updatePhysics.bind(this),
    };

    // Initialize body parts
    this.initializeBodyParts();
  }

  // Initialize physics body parts
  protected initializeBodyParts(): void {
    if (!this.config.enabled) return;

    const qualityMultiplier = {
      low: 0.5,
      medium: 0.75,
      high: 1.0,
      ultra: 1.5,
    }[this.config.quality];

    // Chest (main jiggle part)
    this.chest = this.createBodyPart({
      centerX: 0,
      centerY: 25,
      baseRadius: 12 * qualityMultiplier,
      color: '#ec4899',
      highlightColor: '#f9a8d4',
      shadowColor: '#be185d',
      particleCount: Math.floor(3 * qualityMultiplier),
    });

    // Hips
    this.hips = this.createBodyPart({
      centerX: 0,
      centerY: 50,
      baseRadius: 14 * qualityMultiplier,
      color: '#db2777',
      highlightColor: '#f472b6',
      shadowColor: '#9f1239',
      particleCount: Math.floor(3 * qualityMultiplier),
    });

    // Hair strands (if enabled)
    if (this.visualConfig.particleEffects && this.config.quality !== 'low') {
      for (let i = 0; i < Math.floor(4 * qualityMultiplier); i++) {
        const angle = (i / 4) * Math.PI * 2;
        const hair = this.createBodyPart({
          centerX: Math.cos(angle) * 8,
          centerY: -5 + Math.sin(angle) * 3,
          baseRadius: 2 * qualityMultiplier,
          color: '#8b5cf6',
          highlightColor: '#c4b5fd',
          shadowColor: '#6d28d9',
          particleCount: Math.floor(2 * qualityMultiplier),
        });
        this.hair.push(hair);
      }
    }

    // Thighs (if enabled)
    if (this.config.quality === 'high' || this.config.quality === 'ultra') {
      this.thighs = [
        this.createBodyPart({
          centerX: -8,
          centerY: 65,
          baseRadius: 8 * qualityMultiplier,
          color: '#ec4899',
          highlightColor: '#f9a8d4',
          shadowColor: '#be185d',
          particleCount: Math.floor(2 * qualityMultiplier),
        }),
        this.createBodyPart({
          centerX: 8,
          centerY: 65,
          baseRadius: 8 * qualityMultiplier,
          color: '#ec4899',
          highlightColor: '#f9a8d4',
          shadowColor: '#be185d',
          particleCount: Math.floor(2 * qualityMultiplier),
        }),
      ];
    }

    // Arms (if enabled)
    if (this.config.quality === 'ultra') {
      this.arms = [
        this.createBodyPart({
          centerX: -15,
          centerY: 30,
          baseRadius: 5 * qualityMultiplier,
          color: '#ec4899',
          highlightColor: '#f9a8d4',
          shadowColor: '#be185d',
          particleCount: Math.floor(2 * qualityMultiplier),
        }),
        this.createBodyPart({
          centerX: 15,
          centerY: 30,
          baseRadius: 5 * qualityMultiplier,
          color: '#ec4899',
          highlightColor: '#f9a8d4',
          shadowColor: '#be185d',
          particleCount: Math.floor(2 * qualityMultiplier),
        }),
      ];
    }
  }

  // Create a body part with physics particles
  protected createBodyPart(config: {
    centerX: number;
    centerY: number;
    baseRadius: number;
    color: string;
    highlightColor: string;
    shadowColor: string;
    particleCount: number;
  }): BodyPart {
    const particles: PhysicsParticle[] = [];
    const constraints: PhysicsConstraint[] = [];

    // Create particles in a circle
    for (let i = 0; i < config.particleCount; i++) {
      const angle = (i / config.particleCount) * Math.PI * 2;
      const radius = config.baseRadius * (0.7 + Math.random() * 0.3);
      const x = config.centerX + Math.cos(angle) * radius;
      const y = config.centerY + Math.sin(angle) * radius;

      const particle: PhysicsParticle = {
        position: { x, y },
        previousPosition: { x, y },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: 1.0,
        radius: config.baseRadius / config.particleCount,
        fixed: false,
        damping: this.config.damping,
      };

      particles.push(particle);
      this.physicsEngine.particles.push(particle);
    }

    // Create constraints between adjacent particles
    for (let i = 0; i < particles.length; i++) {
      const nextI = (i + 1) % particles.length;
      const constraint: PhysicsConstraint = {
        particleA: particles[i],
        particleB: particles[nextI],
        restLength: config.baseRadius * 0.5,
        stiffness: 0.9,
        damping: this.config.damping,
      };
      constraints.push(constraint);
      this.physicsEngine.constraints.push(constraint);
    }

    return {
      particles,
      constraints,
      centerX: config.centerX,
      centerY: config.centerY,
      baseRadius: config.baseRadius,
      color: config.color,
      highlightColor: config.highlightColor,
      shadowColor: config.shadowColor,
    };
  }

  // Update physics simulation
  protected updatePhysics(deltaTime: number): void {
    if (!this.config.enabled) return;

    this.time += deltaTime;

    // Apply gravity and forces
    for (const particle of this.physicsEngine.particles) {
      if (particle.fixed) continue;

      // Reset acceleration
      particle.acceleration.x = 0;
      particle.acceleration.y = 0;

      // Apply gravity (light, for jiggle effect)
      particle.acceleration.y += 50; // Light gravity

      // Apply jiggle force (sine wave)
      const jiggleX =
        Math.sin(this.time * this.config.jiggleFrequency * Math.PI * 2) *
        this.config.jiggleAmplitude;
      const jiggleY =
        Math.cos(this.time * this.config.jiggleFrequency * Math.PI * 2) *
        this.config.jiggleAmplitude;
      particle.acceleration.x += jiggleX * 0.1;
      particle.acceleration.y += jiggleY * 0.1;

      // Apply movement-based forces
      const velocityDelta = {
        x: this.lastVelocity.x - (this.baseX - this.lastPosition.x) / deltaTime,
        y: this.lastVelocity.y - (this.baseY - this.lastPosition.y) / deltaTime,
      };

      const movementForce =
        Math.sqrt(velocityDelta.x ** 2 + velocityDelta.y ** 2) * this.config.movementSensitivity;
      if (movementForce > 0.1) {
        particle.acceleration.x += velocityDelta.x * movementForce * 10;
        particle.acceleration.y += velocityDelta.y * movementForce * 10;
      }

      // Apply impacts
      for (let i = this.impacts.length - 1; i >= 0; i--) {
        const impact = this.impacts[i];
        const impactX =
          impact.part === 'chest'
            ? this.chest?.centerX || 0
            : impact.part === 'hips'
              ? this.hips?.centerX || 0
              : 0;
        const impactY =
          impact.part === 'chest'
            ? this.chest?.centerY || 0
            : impact.part === 'hips'
              ? this.hips?.centerY || 0
              : 0;
        const distance = Math.sqrt(
          (particle.position.x - impactX) ** 2 + (particle.position.y - impactY) ** 2,
        );

        if (distance < 30) {
          const force = 1 - distance / 30;
          particle.acceleration.x += impact.force.x * force * this.config.impactMultiplier;
          particle.acceleration.y += impact.force.y * force * this.config.impactMultiplier;
        }

        impact.time -= deltaTime;
        if (impact.time <= 0) {
          this.impacts.splice(i, 1);
        }
      }

      // Apply damping
      particle.acceleration.x *= particle.damping;
      particle.acceleration.y *= particle.damping;
    }

    // Verlet integration
    for (const particle of this.physicsEngine.particles) {
      if (particle.fixed) continue;

      const currentX = particle.position.x;
      const currentY = particle.position.y;

      // Verlet: x(t+dt) = 2*x(t) - x(t-dt) + a*dt^2
      particle.position.x =
        2 * particle.position.x -
        particle.previousPosition.x +
        particle.acceleration.x * deltaTime * deltaTime;
      particle.position.y =
        2 * particle.position.y -
        particle.previousPosition.y +
        particle.acceleration.y * deltaTime * deltaTime;

      particle.previousPosition.x = currentX;
      particle.previousPosition.y = currentY;

      // Update velocity for damping
      particle.velocity.x = (particle.position.x - particle.previousPosition.x) / deltaTime;
      particle.velocity.y = (particle.position.y - particle.previousPosition.y) / deltaTime;
    }

    // Solve constraints (3-5 iterations)
    const iterations = this.config.quality === 'ultra' ? 5 : this.config.quality === 'high' ? 4 : 3;
    for (let iter = 0; iter < iterations; iter++) {
      for (const constraint of this.physicsEngine.constraints) {
        const dx = constraint.particleB.position.x - constraint.particleA.position.x;
        const dy = constraint.particleB.position.y - constraint.particleA.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) continue;

        const difference = (distance - constraint.restLength) / distance;
        const correctionX = dx * difference * constraint.stiffness * 0.5;
        const correctionY = dy * difference * constraint.stiffness * 0.5;

        if (!constraint.particleA.fixed) {
          constraint.particleA.position.x += correctionX;
          constraint.particleA.position.y += correctionY;
        }
        if (!constraint.particleB.fixed) {
          constraint.particleB.position.x -= correctionX;
          constraint.particleB.position.y -= correctionY;
        }
      }
    }
  }

  // Update character state
  update(deltaTime: number, velocity: Vector2D, position: Vector2D): void {
    this.lastVelocity = { ...velocity };
    this.lastPosition = { x: this.baseX, y: this.baseY };
    this.baseX = position.x;
    this.baseY = position.y;

    // Update physics
    if (this.config.enabled) {
      this.physicsEngine.update(deltaTime);
    }
  }

  // Apply impact force
  applyImpact(force: Vector2D, part: string = 'chest'): void {
    if (!this.config.enabled) return;

    this.impacts.push({
      force: { ...force },
      part,
      time: 0.2, // Impact duration
    });
  }

  // Render character
  render(x: number, y: number, facing: 'left' | 'right' = 'right'): void {
    this.baseX = x;
    this.baseY = y;
    this.facing = facing;

    this.ctx.save();
    this.ctx.translate(x, y);
    if (facing === 'left') {
      this.ctx.scale(-1, 1);
    }

    // Render body parts with physics
    if (this.chest) {
      this.renderPhysicsPart(this.chest, 'chest');
    }

    if (this.hips) {
      this.renderPhysicsPart(this.hips, 'hips');
    }

    // Render head (no physics, but cel-shaded)
    this.renderCelShadedHead();

    // Render limbs
    this.renderCelShadedLimbs();

    // Render hair
    for (const hair of this.hair) {
      this.renderPhysicsPart(hair, 'hair');
    }

    // Render thighs
    for (const thigh of this.thighs) {
      this.renderPhysicsPart(thigh, 'thigh');
    }

    // Render arms
    for (const arm of this.arms) {
      this.renderPhysicsPart(arm, 'arm');
    }

    // Apply rim lighting
    if (this.visualConfig.rimLighting) {
      this.renderRimLight();
    }

    // Apply bloom
    if (this.visualConfig.bloom) {
      this.renderBloom();
    }

    this.ctx.restore();
  }

  // Render physics-enabled body part
  protected renderPhysicsPart(part: BodyPart, partType: string): void {
    if (!part || part.particles.length === 0) return;

    // Calculate center from particles
    let centerX = 0;
    let centerY = 0;
    for (const particle of part.particles) {
      centerX += particle.position.x;
      centerY += particle.position.y;
    }
    centerX /= part.particles.length;
    centerY /= part.particles.length;

    // Calculate average radius
    let avgRadius = 0;
    for (let i = 0; i < part.particles.length; i++) {
      const p1 = part.particles[i];
      const p2 = part.particles[(i + 1) % part.particles.length];
      const dist = Math.sqrt(
        (p2.position.x - p1.position.x) ** 2 + (p2.position.y - p1.position.y) ** 2,
      );
      avgRadius += dist;
    }
    avgRadius = (avgRadius / part.particles.length) * 2;

    if (this.visualConfig.celShading) {
      this.renderCelShadedPart(part, centerX, centerY, avgRadius, partType);
    } else {
      this.renderSmoothPart(part, centerX, centerY, avgRadius);
    }
  }

  // Render cel-shaded part (90s anime style)
  protected renderCelShadedPart(
    part: BodyPart,
    centerX: number,
    centerY: number,
    radius: number,
    partType: string,
  ): void {
    // Base color (mid-tone) - adjust based on part type for variety
    const colorMultiplier =
      partType === 'chest' ? 1.0 : partType === 'hips' ? 0.95 : partType === 'hair' ? 0.9 : 1.0;
    const baseColor = this.adjustColorBrightness(part.color, colorMultiplier);
    this.ctx.fillStyle = baseColor;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Shadow (dark tone) - hard edge, no gradient
    const shadowAngle = Math.PI / 4; // 45 degrees
    const shadowX = centerX + Math.cos(shadowAngle) * radius * 0.6;
    const shadowY = centerY + Math.sin(shadowAngle) * radius * 0.6;

    this.ctx.fillStyle = part.shadowColor;
    this.ctx.beginPath();
    this.ctx.arc(shadowX, shadowY, radius * 0.7, 0, Math.PI * 2);
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';

    // Highlight (light tone) - hard edge
    const highlightX = centerX - Math.cos(shadowAngle) * radius * 0.5;
    const highlightY = centerY - Math.sin(shadowAngle) * radius * 0.5;

    this.ctx.fillStyle = part.highlightColor;
    this.ctx.beginPath();
    this.ctx.arc(highlightX, highlightY, radius * 0.5, 0, Math.PI * 2);
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';

    // Bold outline (90s anime style)
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = this.visualConfig.outlineWidth;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  // Render smooth part (fallback)
  protected renderSmoothPart(
    part: BodyPart,
    centerX: number,
    centerY: number,
    radius: number,
  ): void {
    const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, part.highlightColor);
    gradient.addColorStop(0.5, part.color);
    gradient.addColorStop(1, part.shadowColor);

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // Render cel-shaded head
  protected renderCelShadedHead(): void {
    const headRadius = 15 * this.scale;
    const headX = 0;
    const headY = 0;

    // Head base (skin tone)
    const skinGradient = this.ctx.createRadialGradient(
      headX,
      headY - 5,
      0,
      headX,
      headY,
      headRadius,
    );
    skinGradient.addColorStop(0, '#ffd4a3');
    skinGradient.addColorStop(0.7, '#d4a574');
    skinGradient.addColorStop(1, '#b8956a');

    this.ctx.fillStyle = skinGradient;
    this.ctx.beginPath();
    this.ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Cel-shaded shadow
    this.ctx.fillStyle = '#b8956a';
    this.ctx.beginPath();
    this.ctx.arc(headX + 5, headY + 3, headRadius * 0.7, 0, Math.PI * 2);
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';

    // Cel-shaded highlight
    this.ctx.fillStyle = '#ffe4b5';
    this.ctx.beginPath();
    this.ctx.arc(headX - 5, headY - 5, headRadius * 0.6, 0, Math.PI * 2);
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';

    // Render enhanced anime eyes
    this.renderAnimeEyes(headX, headY);

    // Bold outline
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = this.visualConfig.outlineWidth;
    this.ctx.beginPath();
    this.ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  // Render enhanced 90s anime eyes
  protected renderAnimeEyes(centerX: number, centerY: number): void {
    const eyeWidth = 12;
    const eyeHeight = 8;
    const eyeY = centerY - 2;
    const eyeSpacing = 8;

    // Left eye
    this.renderSingleAnimeEye(centerX - eyeSpacing, eyeY, eyeWidth, eyeHeight);

    // Right eye
    this.renderSingleAnimeEye(centerX + eyeSpacing, eyeY, eyeWidth, eyeHeight);
  }

  // Render single anime eye with multiple shine layers
  protected renderSingleAnimeEye(x: number, y: number, width: number, height: number): void {
    // Eye base (white)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Iris (colorful, large)
    const irisGradient = this.ctx.createRadialGradient(x - 2, y - 2, 0, x, y, width / 2.5);
    irisGradient.addColorStop(0, '#8b5cf6');
    irisGradient.addColorStop(0.7, '#6d28d9');
    irisGradient.addColorStop(1, '#4c1d95');
    this.ctx.fillStyle = irisGradient;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, width / 2.5, height / 2.5, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Pupil (black, large)
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.arc(x, y, width / 4, 0, Math.PI * 2);
    this.ctx.fill();

    // CLASSIC 90s ANIME EYE SHINE (the sparkle that makes it!)
    if (this.visualConfig.eyeShineLayers >= 1) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = 1.0;
      this.ctx.beginPath();
      this.ctx.arc(x - 4, y - 2, 2, 0, Math.PI * 2); // Top-left shine (90s signature)
      this.ctx.arc(x + 3, y - 2, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    if (this.visualConfig.eyeShineLayers >= 2) {
      // Secondary shine (more sparkle!)
      this.ctx.globalAlpha = 0.8;
      this.ctx.beginPath();
      this.ctx.arc(x - 3, y, 1.5, 0, Math.PI * 2);
      this.ctx.arc(x + 4, y, 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    if (this.visualConfig.eyeShineLayers >= 3) {
      // Tertiary shine (EXTRA sparkle for maximum effect!)
      this.ctx.globalAlpha = 0.5;
      this.ctx.beginPath();
      this.ctx.arc(x - 4.5, y - 3, 1, 0, Math.PI * 2);
      this.ctx.arc(x + 3.5, y - 3, 1, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;

    // Eye outline (bold, 90s style)
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = this.visualConfig.outlineWidth;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    // Eyelashes (90s anime detail)
    if (this.visualConfig.eyelashes) {
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1.5;
      this.ctx.lineCap = 'round';

      // Top lashes
      for (let i = 0; i < 5; i++) {
        const lashX = x - width / 2 + (i * width) / 4;
        const lashY = y - height / 2;
        const lashLength = 3 + Math.random() * 2;
        this.ctx.beginPath();
        this.ctx.moveTo(lashX, lashY);
        this.ctx.lineTo(lashX + (Math.random() - 0.5) * 2, lashY - lashLength);
        this.ctx.stroke();
      }
    }
  }

  // Render cel-shaded limbs
  protected renderCelShadedLimbs(): void {
    // Simple limb rendering (can be enhanced)
    const limbColor = '#ec4899';
    const limbShadow = '#be185d';

    // Left arm
    this.ctx.fillStyle = limbColor;
    this.ctx.fillRect(-18, 20, 6, 25);

    // Right arm
    this.ctx.fillStyle = limbColor;
    this.ctx.fillRect(12, 20, 6, 25);

    // Cel-shaded shadow on limbs
    this.ctx.fillStyle = limbShadow;
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.fillRect(-18, 25, 6, 20);
    this.ctx.fillRect(12, 25, 6, 20);
    this.ctx.globalCompositeOperation = 'source-over';

    // Bold outlines
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = this.visualConfig.outlineWidth;
    this.ctx.strokeRect(-18, 20, 6, 25);
    this.ctx.strokeRect(12, 20, 6, 25);
  }

  // Render rim light (halo effect)
  protected renderRimLight(): void {
    const rimGradient = this.ctx.createRadialGradient(0, 0, 30, 0, 0, 50);
    rimGradient.addColorStop(0, 'transparent');
    rimGradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.3)');
    rimGradient.addColorStop(1, 'rgba(255, 215, 0, 0.6)');

    this.ctx.fillStyle = rimGradient;
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 50, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';
  }

  // Render bloom effect
  protected renderBloom(): void {
    // Soft glow around character
    const bloomGradient = this.ctx.createRadialGradient(0, 0, 20, 0, 0, 60);
    bloomGradient.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
    bloomGradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.2)');
    bloomGradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = bloomGradient;
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 60, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';
  }

  // Cleanup
  dispose(): void {
    this.physicsEngine.particles = [];
    this.physicsEngine.constraints = [];
    this.chest = null;
    this.hips = null;
    this.hair = [];
    this.thighs = [];
    this.arms = [];
    this.impacts = [];
  }

  // Public accessors for config
  getConfig(): R18PhysicsConfig {
    return this.config;
  }

  setConfig(config: Partial<R18PhysicsConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  setQuality(quality: 'low' | 'medium' | 'high' | 'ultra'): void {
    this.config.quality = quality;
  }

  // Helper to adjust color brightness
  private adjustColorBrightness(color: string, multiplier: number): string {
    // Simple brightness adjustment - if color is hex, parse and adjust
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const newR = Math.min(255, Math.floor(r * multiplier));
      const newG = Math.min(255, Math.floor(g * multiplier));
      const newB = Math.min(255, Math.floor(b * multiplier));
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    return color;
  }
}
