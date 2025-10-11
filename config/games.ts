// DEPRECATED: This component is a duplicate. Use app\lib\games.ts instead.
// config/games.ts
export const GAME_FLAGS = {
  'quick-math': { enabled: false, practice: true }, // practice mode by default
  'samurai-petal-slice': { enabled: true, practice: false },
  'petal-samurai': { enabled: true, practice: false },
  'anime-memory-match': { enabled: true, practice: false },
  'bubble-ragdoll': { enabled: true, practice: false },
  'petal-collection': { enabled: true, practice: false },
  'rhythm-beat-em-up': { enabled: true, practice: false },
  'memory-match': { enabled: true, practice: false },
  'bubble-pop-gacha': { enabled: true, practice: false },
  'petal-storm-rhythm': { enabled: true, practice: false },
  'puzzle-reveal': { enabled: true, practice: false },
  'dungeon-of-desire': { enabled: true, practice: false },
  'thigh-coliseum': { enabled: true, practice: false },
  'maid-cafe-manager': { enabled: true, practice: false },
  'blossomware': { enabled: true, practice: false },
  'bubble-girl': { enabled: true, practice: false },
  'otaku-beat-em-up': { enabled: true, practice: false },
} as const;

export function isEnabled(key: keyof typeof GAME_FLAGS) {
  return GAME_FLAGS[key]?.enabled ?? true;
}
export function isPractice(key: keyof typeof GAME_FLAGS) {
  return GAME_FLAGS[key]?.practice ?? false;
}
