/**
 * Design Tokens for Otaku-mori Visual System
 *
 * Centralized design tokens for consistent styling across the application
 */

export const DESIGN_TOKENS = {
  colors: {
    // Primary theme colors
    background: '#080611',
    surface: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa', // zinc-300
    accentPink: '#ec4899',
    accentPurple: '#8b5cf6',
    accentViolet: '#a855f7',

    // Glass morphism
    glassBg: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glassHover: 'rgba(255, 255, 255, 0.15)',

    // Game colors
    gameSuccess: '#10b981', // emerald-500
    gameWarning: '#f59e0b', // amber-500
    gameError: '#ef4444', // red-500
    gameInfo: '#3b82f6', // blue-500
  },

  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },

  borderRadius: {
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(236, 72, 153, 0.3)',
    glowPurple: '0 0 20px rgba(139, 92, 246, 0.3)',
  },

  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },

  zIndex: {
    background: -11,
    tree: -10,
    petals: -8,
    content: 10,
    header: 50,
    modal: 100,
    tooltip: 200,
  },
} as const;

/**
 * Get a design token value
 */
export function getToken(category: keyof typeof DESIGN_TOKENS, key: string): string | number {
  const categoryTokens = DESIGN_TOKENS[category];
  if (typeof categoryTokens === 'object' && key in categoryTokens) {
    return (categoryTokens as Record<string, string | number>)[key];
  }
  throw new Error(`Token not found: ${category}.${key}`);
}

/**
 * CSS variable helpers
 */
export const CSS_VARS = {
  '--color-background': DESIGN_TOKENS.colors.background,
  '--color-surface': DESIGN_TOKENS.colors.surface,
  '--color-border': DESIGN_TOKENS.colors.border,
  '--color-text-primary': DESIGN_TOKENS.colors.textPrimary,
  '--color-text-secondary': DESIGN_TOKENS.colors.textSecondary,
  '--color-accent-pink': DESIGN_TOKENS.colors.accentPink,
  '--color-accent-purple': DESIGN_TOKENS.colors.accentPurple,
} as const;
