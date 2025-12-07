/**
 * Premium Particle System
 *
 * Reusable particle system for games and effects
 */

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number; // 0-1, starts at 1, decreases to 0
    size: number;
    color: string;
    opacity: number;
    rotation: number;
    rotationSpeed: number;
    }

export type ParticleType = 'petal' | 'sparkle' | 'glow' | 'trail';

export interface ParticleConfig {
    type: ParticleType;
    count: number;
    x: number;
    y: number;
    spread: number;
    speed: number;
    color?: string;
    size?: number;
    lifetime?: number;
    }

export class ParticleSystem {
    private particles: Particle[] = [];
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private animationFrame?: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2D context');
        }
        this.ctx = context;
    }

    /**
     * Emit particles from a point
     */
    emit(config: ParticleConfig) {
        const {
            type: _type, // Reserved for future particle type-specific behavior
            count,
            x,
            y,
            spread,
            speed,
            color = '#ec4899',
            size = 4,
            lifetime: _lifetime = 1000, // Reserved for future lifetime customization
        } = config;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * spread;
            const velocity = speed * (0.5 + Math.random() * 0.5);

            const particle: Particle = {
                x,
                y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1,
                size: size * (0.5 + Math.random() * 0.5),
                color,
                opacity: 0.8 + Math.random() * 0.2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
            };

            this.particles.push(particle);
        }
    }

    /**
     * Update all particles
     */
    update(deltaTime: number) {
        this.particles = this.particles.filter((particle) => {
            // Update position
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;

            // Apply gravity for some particle types
            particle.vy += 0.1 * deltaTime;

            // Update rotation
            particle.rotation += particle.rotationSpeed * deltaTime;

            // Decrease life
            particle.life -= 0.01 * deltaTime;

            // Remove if dead
            return particle.life > 0;
        });
    }

    /**
     * Render all particles
     */
    render() {
        this.ctx.save();

        this.particles.forEach((particle) => {
            const alpha = particle.opacity * particle.life;
            this.ctx.globalAlpha = alpha;

            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);

            // Draw based on type
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });

        this.ctx.restore();
    }

    /**
     * Start animation loop
     */
    start() {
        let lastTime = performance.now();

        const animate = (currentTime: number) => {
            const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2);
            lastTime = currentTime;

            this.update(deltaTime);
            this.render();

            this.animationFrame = requestAnimationFrame(animate);
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    /**
     * Stop animation loop
     */
    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = undefined;
        }
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    }

    /**
     * Get particle count
     */
    getParticleCount(): number {
        return this.particles.length;
    }
}

