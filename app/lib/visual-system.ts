/**
 * Otaku-mori Visual System Lock v0
 * Comprehensive design system with locked typography, motion, and glass effects
 *
 * Usage: Import and use these constants throughout the application
 * DO NOT modify these values without design system approval
 */

import { env } from '@/env.mjs';

// =============================================================================
// TYPOGRAPHY SYSTEM
// =============================================================================

export const TYPOGRAPHY = {
  // Font Families (locked from tailwind.config.ts)
  fonts: {
    display: ['Space Grotesk', 'system-ui', 'sans-serif'],
    ui: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'monospace'],
    japanese: ['Noto Sans JP', 'Yu Gothic', 'Meiryo', 'Takao', 'Hiragino Sans', 'sans-serif'],
  },

  // Font Sizes with line heights (consistent hierarchy)
  sizes: {
    xs: { fontSize: '0.75rem', lineHeight: '1rem' }, // 12px
    sm: { fontSize: '0.875rem', lineHeight: '1.25rem' }, // 14px
    base: { fontSize: '1rem', lineHeight: '1.5rem' }, // 16px
    lg: { fontSize: '1.125rem', lineHeight: '1.75rem' }, // 18px
    xl: { fontSize: '1.25rem', lineHeight: '1.75rem' }, // 20px
    '2xl': { fontSize: '1.5rem', lineHeight: '2rem' }, // 24px
    '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' }, // 30px
    '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem' }, // 36px
    '5xl': { fontSize: '3rem', lineHeight: '1' }, // 48px
    '6xl': { fontSize: '3.75rem', lineHeight: '1' }, // 60px
    '7xl': { fontSize: '4.5rem', lineHeight: '1' }, // 72px
    '8xl': { fontSize: '6rem', lineHeight: '1' }, // 96px
    '9xl': { fontSize: '8rem', lineHeight: '1' }, // 128px
  },

  // Font Weights (semantic naming)
  weights: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Letter Spacing
  tracking: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Semantic Typography Styles
  styles: {
    h1: {
      fontFamily: 'Space Grotesk',
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: '1.1',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontFamily: 'Space Grotesk',
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontFamily: 'Space Grotesk',
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: '1.3',
      letterSpacing: 'normal',
    },
    h4: {
      fontFamily: 'Inter',
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: '1.4',
      letterSpacing: 'normal',
    },
    body: {
      fontFamily: 'Inter',
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: '1.6',
      letterSpacing: 'normal',
    },
    small: {
      fontFamily: 'Inter',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: '1.5',
      letterSpacing: 'normal',
    },
    caption: {
      fontFamily: 'Inter',
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: '1.4',
      letterSpacing: '0.025em',
      textTransform: 'uppercase' as const,
    },
    code: {
      fontFamily: 'Fira Code',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: '1.5',
      letterSpacing: 'normal',
    },
  },
} as const;

// =============================================================================
// MOTION SYSTEM
// =============================================================================

export const MOTION: {
  duration: Record<string, string>;
  easing: Record<string, string>;
  presets: Record<string, { duration: string; easing: string; properties: string[] }>;
  utils: Record<string, any>;
} = {
  // Duration tokens (locked timings for consistency)
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
    slowest: '750ms',
  },

  // Easing curves (emotion-driven motion)
  easing: {
    // Standard easing
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',

    // Custom cubic-bezier curves for specific emotions
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Playful bounce
    gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Gentle acceleration
    sharp: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)', // Sharp entry
    dramatic: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)', // Dramatic entrance
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Elastic overshoot
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material smooth
  },

  // Semantic motion presets
  presets: {
    // UI interactions
    buttonHover: {
      duration: '150ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      properties: ['background-color', 'border-color', 'color', 'box-shadow'],
    },
    buttonPress: {
      duration: '100ms',
      easing: 'cubic-bezier(0.4, 0, 1, 1)',
      properties: ['transform'],
    },
    modalEnter: {
      duration: '250ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      properties: ['opacity', 'transform'],
    },
    modalExit: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 1, 1)',
      properties: ['opacity', 'transform'],
    },

    // Content transitions
    fadeIn: {
      duration: '350ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      properties: ['opacity'],
    },
    slideIn: {
      duration: '300ms',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      properties: ['transform', 'opacity'],
    },

    // GameCube specific (60fps optimized)
    gameCubeRotate: {
      duration: '500ms',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      properties: ['transform'],
    },
    gameCubeBoot: {
      duration: '800ms',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      properties: ['transform', 'opacity'],
    },

    // Petal effects
    petalFall: {
      duration: '3000ms',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      properties: ['transform', 'opacity'],
    },
    petalFloat: {
      duration: '2000ms',
      easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
      properties: ['transform'],
    },
  },

  // Animation utilities
  utils: {
    // Reduced motion handling
    respectsMotionPreference: true,

    // Frame-perfect utilities for 60fps
    frameTime: 16.67, // milliseconds per frame at 60fps

    // Timing functions for code
    getAnimationDuration: (preset: keyof typeof MOTION.presets) => {
      return MOTION.presets[preset].duration;
    },

    // CSS custom properties for dynamic motion
    cssVars: {
      '--motion-duration-fast': '150ms',
      '--motion-duration-normal': '250ms',
      '--motion-duration-slow': '350ms',
      '--motion-easing-gentle': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      '--motion-easing-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
} as const;

// =============================================================================
// GLASS EFFECTS SYSTEM
// =============================================================================

export const GLASS: {
  blur: Record<string, string>;
  opacity: Record<string, string>;
  borders: Record<string, { width: string; style: string; opacity: string }>;
  presets: Record<string, Record<string, string>>;
  utils: Record<string, any>;
} = {
  // Backdrop blur values
  blur: {
    none: 'blur(0)',
    sm: 'blur(4px)',
    base: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(16px)',
    xl: 'blur(24px)',
    '2xl': 'blur(40px)',
    '3xl': 'blur(64px)',
  },

  // Background opacity for glass layers
  opacity: {
    subtle: '0.05',
    light: '0.10',
    medium: '0.15',
    strong: '0.20',
    intense: '0.30',
  },

  // Border configurations for glass elements
  borders: {
    subtle: {
      width: '1px',
      style: 'solid',
      opacity: '0.20',
    },
    visible: {
      width: '1px',
      style: 'solid',
      opacity: '0.30',
    },
    prominent: {
      width: '2px',
      style: 'solid',
      opacity: '0.40',
    },
  },

  // Preset glass effects (complete CSS configurations)
  presets: {
    // Navigation glass
    navbar: {
      background: 'rgba(255, 255, 255, 0.10)',
      backdropFilter: 'blur(12px) saturate(1.5)',
      border: '1px solid rgba(255, 255, 255, 0.20)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    },

    // Modal glass
    modal: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(16px) saturate(1.8)',
      border: '1px solid rgba(255, 255, 255, 0.30)',
      boxShadow: '0 24px 48px rgba(0, 0, 0, 0.18)',
    },

    // Card glass (content cards)
    card: {
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(8px) saturate(1.2)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    },

    // GameCube interface glass
    gamecube: {
      background: 'rgba(147, 51, 234, 0.15)', // purple tint
      backdropFilter: 'blur(12px) saturate(1.5)',
      border: '1px solid rgba(147, 51, 234, 0.30)',
      boxShadow: '0 8px 32px rgba(147, 51, 234, 0.20)',
    },

    // Subtle hover states
    hoverSubtle: {
      background: 'rgba(255, 255, 255, 0.12)',
      backdropFilter: 'blur(10px) saturate(1.3)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.10)',
    },

    // Strong glass for important elements
    strong: {
      background: 'rgba(255, 255, 255, 0.20)',
      backdropFilter: 'blur(20px) saturate(2.0)',
      border: '1px solid rgba(255, 255, 255, 0.40)',
      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)',
    },
  },

  // Utility functions for generating glass CSS
  utils: {
    // Generate complete glass effect CSS
    create: (preset: keyof typeof GLASS.presets) => {
      return GLASS.presets[preset];
    },

    // Custom glass builder
    custom: (blur: string, opacity: string, borderOpacity: string) => ({
      background: `rgba(255, 255, 255, ${opacity})`,
      backdropFilter: `${blur} saturate(1.5)`,
      border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    }),

    // CSS custom properties
    cssVars: {
      '--glass-blur-sm': 'blur(4px)',
      '--glass-blur-base': 'blur(8px)',
      '--glass-blur-lg': 'blur(16px)',
      '--glass-opacity-light': '0.10',
      '--glass-opacity-medium': '0.15',
      '--glass-opacity-strong': '0.20',
    },
  },
} as const;

// =============================================================================
// SPACING & LAYOUT SYSTEM
// =============================================================================

export const SPACING = {
  // Base spacing scale (rem-based for scalability)
  scale: {
    0: '0',
    px: '1px',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem', // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem', // 12px
    3.5: '0.875rem', // 14px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    7: '1.75rem', // 28px
    8: '2rem', // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
    11: '2.75rem', // 44px
    12: '3rem', // 48px
    14: '3.5rem', // 56px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    28: '7rem', // 112px
    32: '8rem', // 128px
    36: '9rem', // 144px
    40: '10rem', // 160px
    44: '11rem', // 176px
    48: '12rem', // 192px
    52: '13rem', // 208px
    56: '14rem', // 224px
    60: '15rem', // 240px
    64: '16rem', // 256px
    72: '18rem', // 288px
    80: '20rem', // 320px
    96: '24rem', // 384px
  },

  // Semantic spacing for consistency
  component: {
    button: {
      paddingX: '1rem', // 16px
      paddingY: '0.5rem', // 8px
      gap: '0.5rem', // 8px between icon and text
    },
    card: {
      padding: '1.5rem', // 24px
      gap: '1rem', // 16px between elements
    },
    modal: {
      padding: '2rem', // 32px
      gap: '1.5rem', // 24px between sections
    },
    section: {
      paddingY: '4rem', // 64px top/bottom
      paddingX: '1.5rem', // 24px left/right
      gap: '2rem', // 32px between content blocks
    },
  },
} as const;

// =============================================================================
// EXPORT UTILITIES
// =============================================================================

// CSS-in-JS utility functions
export const cssUtils = {
  // Apply typography style
  typography: (style: keyof typeof TYPOGRAPHY.styles) => TYPOGRAPHY.styles[style],

  // Apply motion preset
  motion: (preset: keyof typeof MOTION.presets) => {
    const config = MOTION.presets[preset];
    return {
      transitionDuration: config.duration,
      transitionTimingFunction: config.easing,
      transitionProperty: config.properties.join(', '),
    };
  },

  // Apply glass effect
  glass: (preset: keyof typeof GLASS.presets) => GLASS.presets[preset],

  // Spacing utilities
  spacing: (value: keyof typeof SPACING.scale) => SPACING.scale[value],
};

// CSS custom properties for the entire design system
export const CSS_VARS = {
  ...MOTION.utils.cssVars,
  ...GLASS.utils.cssVars,
  // Add more as needed
};

// Runtime validation for development
export const validateDesignToken = (category: string, token: string) => {
  if (env.NODE_ENV === 'development') {
    // Add validation logic for design tokens
    console.warn('Design token validation not yet implemented');
  }
};

// Export everything for easy consumption
export { TYPOGRAPHY as Typography, MOTION as Motion, GLASS as Glass, SPACING as Spacing };

export default {
  typography: TYPOGRAPHY,
  motion: MOTION,
  glass: GLASS,
  spacing: SPACING,
  utils: cssUtils,
};
