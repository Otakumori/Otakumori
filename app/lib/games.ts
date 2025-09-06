export interface GameDefinition {
  key: string;
  name: string;
  tagline: string;
  iconKey: string;
  thumbKey: string;
  howToPlay: string;
  difficulty: 'easy' | 'medium' | 'hard';
  maxRewardPerRun: number;
  sfx: {
    start: string;
    win: string;
    lose: string;
    ui: string[];
  };
  textures: {
    background: string;
    sprites: string[];
    ui: string[];
  };
  featureFlagKey: string;
  seeded: boolean;
  inputMap: {
    keyboard: Record<string, string>;
    gamepad: Record<string, string>;
    touch: Record<string, string>;
  };
}

export const games: Record<string, GameDefinition> = {
  'samurai-petal-slice': {
    key: 'samurai-petal-slice',
    name: 'Samurai Petal Slice',
    tagline: "Draw the Tetsusaiga's arc…",
    iconKey: 'samurai-icon',
    thumbKey: 'samurai-thumb',
    howToPlay: 'Swipe to slice petals with perfect timing. Chain combos for bonus rewards!',
    difficulty: 'medium',
    maxRewardPerRun: 150,
    sfx: {
      start: 'sword-draw',
      win: 'victory-chime',
      lose: 'defeat-thud',
      ui: ['sword-slice', 'petal-burst', 'combo-chime'],
    },
    textures: {
      background: 'dojo-bg',
      sprites: ['katana', 'petals', 'combo-counter'],
      ui: ['slice-arc', 'timing-bar', 'score-display'],
    },
    featureFlagKey: 'samurai_petal_slice_enabled',
    seeded: true,
    inputMap: {
      keyboard: { SPACE: 'Slice', SHIFT: 'Charge', R: 'Reset' },
      gamepad: { A: 'Slice', B: 'Charge', START: 'Pause' },
      touch: { tap: 'Slice', hold: 'Charge', swipe: 'Directional Slice' },
    },
  },
  'anime-memory-match': {
    key: 'anime-memory-match',
    name: 'Anime Memory Match',
    tagline: 'Recall the faces bound by fate.',
    iconKey: 'memory-icon',
    thumbKey: 'memory-thumb',
    howToPlay: 'Find matching anime character pairs. Complete the grid to win!',
    difficulty: 'easy',
    maxRewardPerRun: 100,
    sfx: {
      start: 'card-shuffle',
      win: 'match-success',
      lose: 'time-up',
      ui: ['card-flip', 'match-sparkle', 'streak-chime'],
    },
    textures: {
      background: 'memory-bg',
      sprites: ['anime-faces', 'card-backs', 'streak-counter'],
      ui: ['grid-overlay', 'timer', 'score-display'],
    },
    featureFlagKey: 'anime_memory_match_enabled',
    seeded: true,
    inputMap: {
      keyboard: { ARROWS: 'Navigate', SPACE: 'Select', R: 'Reset' },
      gamepad: { DPAD: 'Navigate', A: 'Select', B: 'Back' },
      touch: { tap: 'Select', swipe: 'Navigate' },
    },
  },
  'bubble-pop-gacha': {
    key: 'bubble-pop-gacha',
    name: 'Bubble-Pop Gacha',
    tagline: 'Pop for spy-craft secrets…',
    iconKey: 'bubble-icon',
    thumbKey: 'bubble-thumb',
    howToPlay: 'Pop bubbles in sequence to unlock gacha rewards. Chain pops for rare items!',
    difficulty: 'medium',
    maxRewardPerRun: 120,
    sfx: {
      start: 'bubble-rise',
      win: 'gacha-reveal',
      lose: 'bubble-burst',
      ui: ['pop-sound', 'chain-chime', 'reward-fanfare'],
    },
    textures: {
      background: 'bubble-bg',
      sprites: ['bubbles', 'gacha-items', 'chain-effects'],
      ui: ['pop-counter', 'gacha-meter', 'reward-display'],
    },
    featureFlagKey: 'bubble_pop_gacha_enabled',
    seeded: true,
    inputMap: {
      keyboard: { SPACE: 'Pop', ARROWS: 'Aim', SHIFT: 'Special' },
      gamepad: { A: 'Pop', RIGHT_STICK: 'Aim', B: 'Special' },
      touch: { tap: 'Pop', drag: 'Aim', 'double-tap': 'Special' },
    },
  },
  'rhythm-beat-em-up': {
    key: 'rhythm-beat-em-up',
    name: 'Rhythm Beat-Em-Up',
    tagline: "Sync to the Moon Prism's pulse.",
    iconKey: 'rhythm-icon',
    thumbKey: 'rhythm-thumb',
    howToPlay: 'Hit beats in four lanes to the rhythm. Perfect timing earns combos!',
    difficulty: 'hard',
    maxRewardPerRun: 200,
    sfx: {
      start: 'beat-intro',
      win: 'perfect-clear',
      lose: 'rhythm-break',
      ui: ['hit-sound', 'combo-ding', 'miss-thud'],
    },
    textures: {
      background: 'rhythm-bg',
      sprites: ['beat-markers', 'combo-counter', 'lane-effects'],
      ui: ['timing-bar', 'score-display', 'combo-meter'],
    },
    featureFlagKey: 'rhythm_beat_em_up_enabled',
    seeded: true,
    inputMap: {
      keyboard: { D: 'Lane 1', F: 'Lane 2', J: 'Lane 3', K: 'Lane 4' },
      gamepad: { A: 'Lane 1', B: 'Lane 2', X: 'Lane 3', Y: 'Lane 4' },
      touch: {
        'tap-lane-1': 'Lane 1',
        'tap-lane-2': 'Lane 2',
        'tap-lane-3': 'Lane 3',
        'tap-lane-4': 'Lane 4',
      },
    },
  },
  'memory-match': {
    key: 'memory-match',
    name: 'Memory Match',
    tagline: 'Simple pairs, endless fun.',
    iconKey: 'pairs-icon',
    thumbKey: 'pairs-thumb',
    howToPlay: 'Find matching pairs in a simple grid. Perfect for quick sessions!',
    difficulty: 'easy',
    maxRewardPerRun: 80,
    sfx: {
      start: 'card-shuffle',
      win: 'pairs-complete',
      lose: 'time-up',
      ui: ['card-flip', 'match-sparkle', 'ui-click'],
    },
    textures: {
      background: 'pairs-bg',
      sprites: ['tarot-cards', 'card-backs', 'simple-icons'],
      ui: ['grid-overlay', 'timer', 'pairs-counter'],
    },
    featureFlagKey: 'memory_match_enabled',
    seeded: true,
    inputMap: {
      keyboard: { ARROWS: 'Navigate', SPACE: 'Select', R: 'Reset' },
      gamepad: { DPAD: 'Navigate', A: 'Select', B: 'Back' },
      touch: { tap: 'Select', swipe: 'Navigate' },
    },
  },

  'petal-collection': {
    key: 'petal-collection',
    name: 'Petal Collection',
    tagline: 'Economy pacing prototype.',
    iconKey: 'petal-icon',
    thumbKey: 'petal-thumb',
    howToPlay: 'Collect falling petals. Simple but effective for economy pacing!',
    difficulty: 'easy',
    maxRewardPerRun: 60,
    sfx: {
      start: 'petal-fall',
      win: 'collection-complete',
      lose: 'time-up',
      ui: ['petal-collect', 'ui-click', 'simple-chime'],
    },
    textures: {
      background: 'watercolor-bg',
      sprites: ['falling-petals', 'collector', 'simple-effects'],
      ui: ['collection-counter', 'timer', 'prototype-label'],
    },
    featureFlagKey: 'petal_collection_enabled',
    seeded: true,
    inputMap: {
      keyboard: { ARROWS: 'Move', SPACE: 'Collect', R: 'Reset' },
      gamepad: { LEFT_STICK: 'Move', A: 'Collect', B: 'Reset' },
      touch: { drag: 'Move', tap: 'Collect' },
    },
  },
};

export function getGameDef(key: string): GameDefinition | null {
  return games[key] || null;
}

export function isGameEnabled(key: string): boolean {
  const game = getGameDef(key);
  if (!game) return false;

  // Check game flags from config
  try {
    const { isEnabled } = require('@/config/games');
    return isEnabled(key);
  } catch {
    // Fallback to environment variables if config not available
    const flagKey = game.featureFlagKey;
    const envValue = process.env[`NEXT_PUBLIC_${flagKey.toUpperCase()}`];
    return envValue === 'true' || envValue === '1';
  }
}

export function getEnabledGames(): GameDefinition[] {
  return Object.values(games).filter((game) => isGameEnabled(game.key));
}

export function getGameBySlug(slug: string): GameDefinition | null {
  return Object.values(games).find((game) => game.key === slug) || null;
}
