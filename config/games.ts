/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
// config/games.ts
export const GAME_FLAGS = {
  "quick-math": { enabled: false, practice: true }, // practice mode by default
  "samurai-petal-slice": { enabled: true, practice: false },
  "anime-memory-match": { enabled: true, practice: false },
  "bubble-ragdoll": { enabled: true, practice: false },
  "petal-collection": { enabled: true, practice: false },
  "rhythm-beat-em-up": { enabled: true, practice: false },
  "memory-match": { enabled: true, practice: false },
  "bubble-pop-gacha": { enabled: true, practice: false }
} as const;

export function isEnabled(key: keyof typeof GAME_FLAGS){ return GAME_FLAGS[key].enabled; }
export function isPractice(key: keyof typeof GAME_FLAGS){ return GAME_FLAGS[key].practice; }
