/**
 * Visual System Configuration
 *
 * Unified visual system for consistent styling across the application
 */


export interface VisualSystemConfig {
  theme: 'dark' | 'light';
  glassMorphism: boolean;
  animations: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_VISUAL_CONFIG: VisualSystemConfig = {
  theme: 'dark',
  glassMorphism: true,
  animations: true,
  reducedMotion: false,
};

/**
 * Glass morphism utility classes
 */
export const GLASS_STYLES = {
  card: 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl',
  surface: 'bg-white/5 backdrop-blur-md border border-white/10 rounded-xl',
  hover: 'hover:bg-white/15 transition-colors duration-300',
  active: 'active:bg-white/20',
} as const;

/**
 * Animation utilities
 */
export const ANIMATION_STYLES = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
  glow: 'animate-glow',
} as const;

/**
 * Get glass morphism classes
 */
export function getGlassClasses(variant: 'card' | 'surface' = 'card'): string {
  const base = GLASS_STYLES[variant];
  return `${base} ${GLASS_STYLES.hover}`;
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation classes based on motion preference
 */
export function getAnimationClasses(animation: keyof typeof ANIMATION_STYLES): string {
  if (prefersReducedMotion()) {
    return ''; // No animation for reduced motion
  }
  return ANIMATION_STYLES[animation];
}

/**
 * Color utilities
 */
export const COLOR_UTILS = {
  /**
   * Convert hex to rgba
   */
  hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  /**
   * Get gradient string
   */
  gradient(colors: string[], direction: 'horizontal' | 'vertical' | 'diagonal' = 'diagonal'): string {
    const dirMap = {
      horizontal: 'to right',
      vertical: 'to bottom',
      diagonal: '135deg',
    };
    return `linear-gradient(${dirMap[direction]}, ${colors.join(', ')})`;
  },
} as const;
