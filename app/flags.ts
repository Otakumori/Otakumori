import { z } from 'zod';

const Flags = z.object({
  NEXT_PUBLIC_FEATURE_MINIGAMES: z.enum(['on', 'off']).default('on'),
  NEXT_PUBLIC_FEATURE_RUNE: z.enum(['on', 'off']).default('off'),
  NEXT_PUBLIC_FEATURE_SOAPSTONE: z.enum(['on', 'off']).default('on'),
  NEXT_PUBLIC_FEATURE_PETALS: z.enum(['on', 'off']).default('on'),
  NEXT_PUBLIC_FEATURE_CURSOR_GLOW: z.enum(['on', 'off']).default('off'),
  NEXT_PUBLIC_FEATURE_STARFIELD: z.enum(['on', 'off']).default('on'),
});

export const flags = Flags.parse({
  NEXT_PUBLIC_FEATURE_MINIGAMES: process.env.NEXT_PUBLIC_FEATURE_MINIGAMES || 'on',
  NEXT_PUBLIC_FEATURE_RUNE: process.env.NEXT_PUBLIC_FEATURE_RUNE || 'off',
  NEXT_PUBLIC_FEATURE_SOAPSTONE: process.env.NEXT_PUBLIC_FEATURE_SOAPSTONE || 'on',
  NEXT_PUBLIC_FEATURE_PETALS: process.env.NEXT_PUBLIC_FEATURE_PETALS || 'on',
  NEXT_PUBLIC_FEATURE_CURSOR_GLOW: process.env.NEXT_PUBLIC_FEATURE_CURSOR_GLOW || 'off',
  NEXT_PUBLIC_FEATURE_STARFIELD: process.env.NEXT_PUBLIC_FEATURE_STARFIELD || 'on',
});
export const isOn = (v: 'on' | 'off') => v === 'on';

// Convenience helpers
export const isMinigamesEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_MINIGAMES);
export const isRuneEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_RUNE);
export const isSoapstoneEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_SOAPSTONE);
export const isPetalsEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_PETALS);
export const isCursorGlowEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_CURSOR_GLOW);
export const isStarfieldEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_STARFIELD);
