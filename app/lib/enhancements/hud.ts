/**
 * HUD Enhancement Utilities
 *
 * Utilities for enhanced game HUD components
 */

export interface ScoreDisplayConfig {
  animated: boolean;
  format: 'number' | 'comma' | 'short'; // e.g., 1000, 1,000, 1K
  color: string;
  glow: boolean;
}

export interface HealthBarConfig {
  maxHealth: number;
  currentHealth: number;
  showPercentage: boolean;
  color: string;
  backgroundColor: string;
  animated: boolean;
}

export interface TimerConfig {
  time: number; // seconds
  showMilliseconds: boolean;
  urgencyThreshold: number; // seconds
  urgencyColor: string;
  normalColor: string;
}

export interface ComboConfig {
  count: number;
  multiplier: number;
  showCelebration: boolean;
  celebrationThreshold: number;
}

/**
 * Format score based on configuration
 */
export function formatScore(score: number, format: ScoreDisplayConfig['format']): string {
  switch (format) {
    case 'comma':
      return score.toLocaleString();
    case 'short':
      if (score >= 1000000) {
        return `${(score / 1000000).toFixed(1)}M`;
      }
      if (score >= 1000) {
        return `${(score / 1000).toFixed(1)}K`;
      }
      return score.toString();
    case 'number':
    default:
      return score.toString();
  }
}

/**
 * Get health bar percentage
 */
export function getHealthPercentage(config: HealthBarConfig): number {
  return Math.max(0, Math.min(100, (config.currentHealth / config.maxHealth) * 100));
}

/**
 * Get health bar color based on percentage
 */
export function getHealthBarColor(percentage: number): string {
  if (percentage > 60) {
    return '#10b981'; // emerald-500
  }
  if (percentage > 30) {
    return '#f59e0b'; // amber-500
  }
  return '#ef4444'; // red-500
}

/**
 * Format timer
 */
export function formatTimer(config: TimerConfig): string {
  const minutes = Math.floor(config.time / 60);
  const seconds = Math.floor(config.time % 60);
  const milliseconds = Math.floor((config.time % 1) * 100);

  if (config.showMilliseconds) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get timer color based on urgency
 */
export function getTimerColor(config: TimerConfig): string {
  if (config.time <= config.urgencyThreshold) {
    return config.urgencyColor;
  }
  return config.normalColor;
}

/**
 * Check if combo should show celebration
 */
export function shouldShowComboCelebration(config: ComboConfig): boolean {
  return config.showCelebration && config.count >= config.celebrationThreshold;
}

/**
 * Get combo multiplier text
 */
export function getComboMultiplierText(multiplier: number): string {
  if (multiplier >= 10) {
    return `${multiplier.toFixed(1)}x LEGENDARY!`;
  }
  if (multiplier >= 5) {
    return `${multiplier.toFixed(1)}x AMAZING!`;
  }
  if (multiplier >= 2) {
    return `${multiplier.toFixed(1)}x COMBO!`;
  }
  return '';
}

/**
 * Animate number with easing
 */
export function animateNumber(
  current: number,
  target: number,
  speed: number = 0.1,
): number {
  return current + (target - current) * speed;
}

/**
 * Pulse animation value
 */
export function pulseAnimation(time: number, speed: number = 0.02): number {
  return 1 + Math.sin(time * speed) * 0.1;
}
