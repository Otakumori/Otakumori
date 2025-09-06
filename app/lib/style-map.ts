// Unified source of truth for avatar → vibe
export type Vibe = 'spicy-male' | 'spicy-female' | 'neutral';

export const avatarVibes: Record<string, Vibe> = {
  akira: 'spicy-male',
  dante: 'spicy-male',
  yumi: 'spicy-female',
  seraphina: 'spicy-female',
  guardian: 'neutral',
  npc_shopkeep: 'neutral',
};

// Safe resolver. Pass a CLI override to force a vibe if needed.
export function getVibeForAvatar(avatar: string, override?: Vibe): Vibe {
  if (override === 'spicy-male' || override === 'spicy-female' || override === 'neutral') {
    return override;
  }
  const key = (avatar || '').toLowerCase().trim();
  return avatarVibes[key] ?? 'neutral';
}

export function pickPresetForGame(game: string, avatar: string): string {
  const vibe = avatarVibes[avatar] || 'neutral';
  const preset = vibePresets[vibe];
  // if you want certain games to override:
  if (game === 'trade' && vibe === 'spicy-male') return 'minigame.arcade.neon';
  if (game === 'snake' && vibe === 'spicy-female') return 'minigame.candy.pop';
  return preset;
}

export const vibePresets: Record<Vibe, string> = {
  'spicy-male': 'minigame.noir.tech',
  'spicy-female': 'minigame.candy.pop',
  neutral: 'minigame.forest.cozy',
};
