/**
 * Hit Feedback Effects
 *
 * Visual effects for game hit feedback (score popups, screen shake, etc.)
 */

export interface HitEffect {
  type: 'score' | 'combo' | 'perfect' | 'miss';
  x: number;
  y: number;
  value?: number;
  life: number; // 0-1
  }

export interface ScreenShakeConfig {
  intensity: number;
  duration: number;
  frequency: number;
}

export class HitEffectSystem {
  private effects: HitEffect[] = [];
  private screenShake: ScreenShakeConfig | null = null;
  private screenShakeTime = 0;

  /**
   * Add a hit effect
   */
  addEffect(effect: Omit<HitEffect, 'life'>): void {
    this.effects.push({
      ...effect,
      life: 1,
    });
  }

  /**
   * Trigger screen shake
   */
  shake(config: ScreenShakeConfig): void {
    this.screenShake = config;
    this.screenShakeTime = 0;
  }

  /**
   * Update all effects
   */
  update(deltaTime: number): void {
    // Update hit effects
    this.effects = this.effects
      .map((effect) => ({
        ...effect,
        life: Math.max(0, effect.life - deltaTime * 0.05), // Fade out over ~1 second
      }))
      .filter((effect) => effect.life > 0);

    // Update screen shake
    if (this.screenShake) {
      this.screenShakeTime += deltaTime * 16.67; // Convert to ms

      if (this.screenShakeTime >= this.screenShake.duration) {
        this.screenShake = null;
        this.screenShakeTime = 0;
      }
    }
  }

  /**
   * Get current screen shake offset
   */
  getScreenShakeOffset(): [number, number] {
    if (!this.screenShake) {
      return [0, 0];
    }

    const progress = this.screenShakeTime / this.screenShake.duration;
    const intensity = this.screenShake.intensity * (1 - progress); // Fade out

    const x = (Math.random() - 0.5) * 2 * intensity;
    const y = (Math.random() - 0.5) * 2 * intensity;

    return [x, y];
  }

  /**
   * Get all active effects
   */
  getEffects(): HitEffect[] {
    return [...this.effects];
  }

  /**
   * Clear all effects
   */
  clear(): void {
    this.effects = [];
    this.screenShake = null;
    this.screenShakeTime = 0;
  }
}

/**
 * Get color for hit effect type
 */
export function getHitEffectColor(type: HitEffect['type']): string {
  switch (type) {
    case 'perfect':
      return '#10b981'; // emerald-500
    case 'combo':
      return '#8b5cf6'; // purple-500
    case 'score':
      return '#ec4899'; // pink-500
    case 'miss':
      return '#ef4444'; // red-500
    default:
      return '#ffffff';
  }
}

/**
 * Get animation for hit effect type
 */
export function getHitEffectAnimation(type: HitEffect['type']): {
  scale: number;
  opacity: number;
  yOffset: number;
} {
  switch (type) {
    case 'perfect':
      return {
        scale: 1.5,
        opacity: 1.0,
        yOffset: -30,
      };
    case 'combo':
      return {
        scale: 1.3,
        opacity: 0.9,
        yOffset: -25,
      };
    case 'score':
      return {
        scale: 1.2,
        opacity: 0.8,
        yOffset: -20,
      };
    case 'miss':
      return {
        scale: 1.0,
        opacity: 0.6,
        yOffset: -15,
      };
    default:
      return {
        scale: 1.0,
        opacity: 0.8,
        yOffset: -20,
      };
  }
}
