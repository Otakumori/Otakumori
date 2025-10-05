import { z } from 'zod';

// Zod schema for game definition validation
const GameDefinitionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['ready', 'beta', 'alpha', 'disabled']),
  ageRating: z.enum(['E', 'T', 'M']).optional(),
  howToHtml: z.string().min(1),
  defaultMap: z.string().min(1),
  supportsAvatar: z.boolean().default(false),
  supportsController: z.boolean().default(true),
  featureFlag: z.string().optional(),
  maxRewardPerRun: z.number().min(0).default(100),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  category: z.enum(['action', 'puzzle', 'strategy', 'rhythm', 'adventure']),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  icon: z.string().optional(),
});

export type GameDefinition = z.infer<typeof GameDefinitionSchema>;

// Centralized games registry - single source of truth
export const GAMES: GameDefinition[] = [
  {
    id: 'petal-samurai',
    slug: 'petal-samurai',
    title: 'Petal Samurai',
    description: "Draw the Tetsusaiga's arc…",
    status: 'ready',
    ageRating: 'E',
    howToHtml:
      '<p>Swipe to slice petals with perfect timing. Chain combos for bonus rewards!</p><ul><li><strong>Controls:</strong> Swipe gestures or arrow keys</li><li><strong>Goal:</strong> Slice petals without missing</li><li><strong>Combo:</strong> Chain slices for multipliers</li></ul>',
    defaultMap: 'dojo',
    supportsAvatar: true,
    supportsController: true,
    featureFlag: 'petal_samurai_enabled',
    maxRewardPerRun: 150,
    difficulty: 'medium',
    category: 'action',
    tags: ['sword', 'timing', 'combo'],
    thumbnail: '/games/thumbnails/petal-samurai.jpg',
    icon: 'katana',
  },
  {
    id: 'memory-match',
    slug: 'memory-match',
    title: 'Memory Match',
    description: 'Recall the faces bound by fate.',
    status: 'ready',
    ageRating: 'E',
    howToHtml:
      '<p>Find matching anime character pairs. Complete the grid to win!</p><ul><li><strong>Controls:</strong> Click cards to flip</li><li><strong>Goal:</strong> Match all pairs</li><li><strong>Time:</strong> Complete as fast as possible</li></ul>',
    defaultMap: 'memory',
    supportsAvatar: false,
    supportsController: true,
    featureFlag: 'memory_match_enabled',
    maxRewardPerRun: 100,
    difficulty: 'easy',
    category: 'puzzle',
    tags: ['memory', 'anime', 'cards'],
    thumbnail: '/games/thumbnails/memory-match.jpg',
    icon: 'cards',
  },
  {
    id: 'otaku-beat-em-up',
    slug: 'otaku-beat-em-up',
    title: 'Otaku Beat-Em-Up',
    description: "Sync to the Moon Prism's pulse.",
    status: 'ready',
    ageRating: 'E',
    howToHtml:
      '<p>Four-lane rhythm game with anime music. Hit notes in time with the beat!</p><ul><li><strong>Controls:</strong> D/F/J/K keys or gamepad</li><li><strong>Goal:</strong> Hit notes in perfect time</li><li><strong>Combo:</strong> Chain hits for multipliers</li></ul>',
    defaultMap: 'neon',
    supportsAvatar: true,
    supportsController: true,
    featureFlag: 'otaku_beat_em_up_enabled',
    maxRewardPerRun: 200,
    difficulty: 'hard',
    category: 'rhythm',
    tags: ['rhythm', 'music', 'anime'],
    thumbnail: '/games/thumbnails/otaku-beat-em-up.jpg',
    icon: 'music',
  },
  {
    id: 'bubble-girl',
    slug: 'bubble-girl',
    title: 'Bubble Girl',
    description: 'Spawn bubbles, float and score. Sandbox or challenge mode.',
    status: 'ready',
    ageRating: 'E',
    howToHtml:
      '<p>Pop bubbles in this relaxing puzzle game. Create chain reactions for high scores!</p><ul><li><strong>Controls:</strong> Click bubbles to pop</li><li><strong>Goal:</strong> Clear the screen</li><li><strong>Strategy:</strong> Chain pops for bonuses</li></ul>',
    defaultMap: 'bubble',
    supportsAvatar: false,
    supportsController: false,
    featureFlag: 'bubble_girl_enabled',
    maxRewardPerRun: 80,
    difficulty: 'easy',
    category: 'puzzle',
    tags: ['bubble', 'puzzle', 'relaxing'],
    thumbnail: '/games/thumbnails/bubble-girl.jpg',
    icon: 'bubble',
  },
  {
    id: 'petal-storm-rhythm',
    slug: 'petal-storm-rhythm',
    title: 'Petal Storm Rhythm',
    description: 'Stormy rhythm playlist—precision timing for petals.',
    status: 'ready',
    ageRating: 'E',
    howToHtml:
      '<p>Rhythm game with falling petals. Hit the notes as they reach the bottom!</p><ul><li><strong>Controls:</strong> Space bar or tap</li><li><strong>Goal:</strong> Hit petals in rhythm</li><li><strong>Timing:</strong> Perfect timing = higher score</li></ul>',
    defaultMap: 'sakura',
    supportsAvatar: true,
    supportsController: true,
    featureFlag: 'petal_storm_rhythm_enabled',
    maxRewardPerRun: 120,
    difficulty: 'medium',
    category: 'rhythm',
    tags: ['rhythm', 'petals', 'falling'],
    thumbnail: '/games/thumbnails/petal-storm-rhythm.jpg',
    icon: 'petals',
  },
  {
    id: 'blossomware',
    slug: 'blossomware',
    title: 'Blossom-ware',
    description: 'Chaotic micro-sessions—keep your petal streak alive.',
    status: 'ready',
    ageRating: 'E',
    howToHtml:
      "<p>Quick micro-games in rapid succession. Keep your streak alive!</p><ul><li><strong>Controls:</strong> Various per mini-game</li><li><strong>Goal:</strong> Complete as many as possible</li><li><strong>Streak:</strong> Don't break the chain!</li></ul>",
    defaultMap: 'chaos',
    supportsAvatar: true,
    supportsController: true,
    featureFlag: 'blossomware_enabled',
    maxRewardPerRun: 300,
    difficulty: 'hard',
    category: 'action',
    tags: ['micro-games', 'streak', 'chaos'],
    thumbnail: '/games/thumbnails/blossomware.jpg',
    icon: 'blossom',
  },
  {
    id: 'dungeon-of-desire',
    slug: 'dungeon-of-desire',
    title: 'Dungeon of Desire',
    description: 'Descend into the dungeon. Survive rooms and claim rewards.',
    status: 'beta',
    ageRating: 'M',
    howToHtml:
      '<p>Roguelike dungeon crawler with anime aesthetics. Fight monsters and collect loot!</p><ul><li><strong>Controls:</strong> WASD + mouse</li><li><strong>Goal:</strong> Survive as long as possible</li><li><strong>Loot:</strong> Collect weapons and upgrades</li></ul>',
    defaultMap: 'dungeon',
    supportsAvatar: true,
    supportsController: true,
    featureFlag: 'dungeon_of_desire_enabled',
    maxRewardPerRun: 250,
    difficulty: 'hard',
    category: 'adventure',
    tags: ['roguelike', 'dungeon', 'anime', 'adult'],
    thumbnail: '/games/thumbnails/dungeon-of-desire.jpg',
    icon: 'dungeon',
  },
  {
    id: 'thigh-coliseum',
    slug: 'thigh-coliseum',
    title: 'Thigh Colosseum',
    description: 'Enter the arena. Win rounds and advance the bracket.',
    status: 'beta',
    ageRating: 'M',
    howToHtml:
      '<p>Fighting game with anime characters. Battle opponents in tournament brackets!</p><ul><li><strong>Controls:</strong> Arrow keys + Z/X</li><li><strong>Goal:</strong> Win tournament rounds</li><li><strong>Combat:</strong> Learn combos and timing</li></ul>',
    defaultMap: 'arena',
    supportsAvatar: true,
    supportsController: true,
    featureFlag: 'thigh_coliseum_enabled',
    maxRewardPerRun: 300,
    difficulty: 'hard',
    category: 'action',
    tags: ['fighting', 'tournament', 'anime', 'adult'],
    thumbnail: '/games/thumbnails/thigh-coliseum.jpg',
    icon: 'arena',
  },
  {
    id: 'puzzle-reveal',
    slug: 'puzzle-reveal',
    title: 'Puzzle Reveal',
    description: 'Clear the fog to reveal the art. Watch your energy.',
    status: 'ready',
    ageRating: 'E',
    howToHtml:
      '<p>Reveal hidden artwork by clearing fog tiles. Manage your energy carefully!</p><ul><li><strong>Controls:</strong> Click tiles to clear</li><li><strong>Goal:</strong> Reveal the complete image</li><li><strong>Energy:</strong> Limited clears per level</li></ul>',
    defaultMap: 'mystery',
    supportsAvatar: false,
    supportsController: false,
    featureFlag: 'puzzle_reveal_enabled',
    maxRewardPerRun: 90,
    difficulty: 'medium',
    category: 'puzzle',
    tags: ['puzzle', 'reveal', 'art'],
    thumbnail: '/games/thumbnails/puzzle-reveal.jpg',
    icon: 'puzzle',
  },
];

// Build-time duplicate detection
const gameIds = new Set(GAMES.map((game) => game.id));
const gameSlugs = new Set(GAMES.map((game) => game.slug));

if (gameIds.size !== GAMES.length) {
  throw new Error('Duplicate game IDs found in registry');
}

if (gameSlugs.size !== GAMES.length) {
  throw new Error('Duplicate game slugs found in registry');
}

// Export types for compile-time safety
export type GameId = (typeof GAMES)[number]['id'];
export type GameSlug = (typeof GAMES)[number]['slug'];

// Helper functions
export function getGameById(id: GameId): GameDefinition | undefined {
  return GAMES.find((game) => game.id === id);
}

export function getGameBySlug(slug: GameSlug): GameDefinition | undefined {
  return GAMES.find((game) => game.slug === slug);
}

export function getGamesByCategory(category: GameDefinition['category']): GameDefinition[] {
  return GAMES.filter((game) => game.category === category);
}

export function getEnabledGames(): GameDefinition[] {
  return GAMES.filter((game) => game.status === 'ready' || game.status === 'beta');
}

export function getFeaturedGames(): GameDefinition[] {
  return GAMES.filter((game) => game.status === 'ready').slice(0, 6);
}

// Validate all games at import time
GAMES.forEach((game, index) => {
  try {
    GameDefinitionSchema.parse(game);
  } catch (error) {
    throw new Error(`Invalid game definition at index ${index}: ${error}`);
  }
});

export default GAMES;
