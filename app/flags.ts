import { z } from 'zod';
import { env } from '@/env.mjs';

const Flags = z.object({
  NEXT_PUBLIC_FEATURE_MINIGAMES: z.enum(['on', 'off']).default('on'),
  NEXT_PUBLIC_FEATURE_RUNE: z.enum(['on', 'off']).default('off'),
  NEXT_PUBLIC_FEATURE_SOAPSTONE: z.enum(['on', 'off']).default('on'),
  NEXT_PUBLIC_FEATURE_PETALS: z.enum(['on', 'off']).default('on'),
  NEXT_PUBLIC_FEATURE_CURSOR_GLOW: z.enum(['on', 'off']).default('off'),
  NEXT_PUBLIC_FEATURE_STARFIELD: z.enum(['on', 'off']).default('on'),
  NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2: z.enum(['on', 'off']).default('on'),
  NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY: z.enum(['on', 'off']).default('on'),
  NEXT_PUBLIC_FEATURE_TRADE_PROPOSE: z.enum(['on', 'off']).default('off'),
  NEXT_PUBLIC_FEATURE_DIRTY_EMOTES: z.enum(['on', 'off']).default('on'),
  NEXT_PUBLIC_FEATURE_JIGGLE: z.enum(['on', 'off']).default('on'),
  NEXT_PUBLIC_FEATURE_EVENTS: z.enum(['on', 'off']).default('on'),
});

export const flags = Flags.parse({
  NEXT_PUBLIC_FEATURE_MINIGAMES: env.NEXT_PUBLIC_FEATURE_MINIGAMES || 'on',
  NEXT_PUBLIC_FEATURE_RUNE: env.NEXT_PUBLIC_FEATURE_RUNE || 'off',
  NEXT_PUBLIC_FEATURE_SOAPSTONE: env.NEXT_PUBLIC_FEATURE_SOAPSTONE || 'on',
  NEXT_PUBLIC_FEATURE_PETALS: env.NEXT_PUBLIC_FEATURE_PETALS || 'on',
  NEXT_PUBLIC_FEATURE_CURSOR_GLOW: env.NEXT_PUBLIC_FEATURE_CURSOR_GLOW || 'off',
  NEXT_PUBLIC_FEATURE_STARFIELD: env.NEXT_PUBLIC_FEATURE_STARFIELD || 'on',
  NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2: env.NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2 || 'on',
  NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY: env.NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY || 'on',
  NEXT_PUBLIC_FEATURE_TRADE_PROPOSE: env.NEXT_PUBLIC_FEATURE_TRADE_PROPOSE || 'off',
  NEXT_PUBLIC_FEATURE_DIRTY_EMOTES: env.NEXT_PUBLIC_FEATURE_DIRTY_EMOTES || 'on',
  NEXT_PUBLIC_FEATURE_JIGGLE: env.NEXT_PUBLIC_FEATURE_JIGGLE || 'on',
  NEXT_PUBLIC_FEATURE_EVENTS: env.NEXT_PUBLIC_FEATURE_EVENTS || 'on',
});
export const isOn = (v: 'on' | 'off') => v === 'on';

// Convenience helpers
export const isMinigamesEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_MINIGAMES);
export const isRuneEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_RUNE);
export const isSoapstoneEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_SOAPSTONE);
export const isPetalsEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_PETALS);
export const isCursorGlowEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_CURSOR_GLOW);
export const isStarfieldEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_STARFIELD);
export const isCommunityFaceEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2);
export const isTradeProposeEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_TRADE_PROPOSE);
export const isDirtyEmotesEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_DIRTY_EMOTES);
export const isJiggleEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_JIGGLE);
export const isEventsEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_EVENTS);
