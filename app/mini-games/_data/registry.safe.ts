import { z } from 'zod';
import { env } from '@/env';

const GameStatus = z.enum(['available', 'beta', 'offline']);

export const GameSchema = z.object({
  id: z.string(),
  title: z.string(),
  path: z.string(),
  status: GameStatus,
  howToHtml: z.string().optional(),
});

export type Game = z.infer<typeof GameSchema>;

export const games: Game[] = [
  {
    id: 'petal-run',
    title: 'Petal Run',
    path: '/mini-games/petal-run',
    status: 'available',
    howToHtml:
      '<p>Run through the petal storm! Use arrow keys or WASD to move, spacebar to jump. Collect petals for points and avoid obstacles.</p>',
  },
  {
    id: 'memory',
    title: 'Memory Match',
    path: '/mini-games/memory',
    status: 'available',
    howToHtml:
      '<p>Find matching pairs! Click on cards to flip them. Match all pairs to win. Use your memory to remember card positions.</p>',
  },
  {
    id: 'rhythm',
    title: 'Rhythm Beat',
    path: '/mini-games/rhythm',
    status: 'available',
    howToHtml:
      '<p>Hit the beats! Press the corresponding keys (D, F, J, K) when the notes reach the bottom. Perfect timing earns more points!</p>',
  },
  {
    id: 'samurai-petal-slice',
    title: 'Samurai Petal Slice',
    path: '/mini-games/samurai-petal-slice',
    status: 'available',
    howToHtml:
      "<p>Draw the Tetsusaiga's arc… Slice through petals with perfect timing. Chain combos for bonus rewards!</p>",
  },
  {
    id: 'anime-memory-match',
    title: 'Anime Memory Match',
    path: '/mini-games/anime-memory-match',
    status: 'available',
    howToHtml:
      '<p>Recall the faces bound by fate. Find matching anime character pairs. Complete the grid to win!</p>',
  },
  {
    id: 'bubble-pop-gacha',
    title: 'Bubble-Pop Gacha',
    path: '/mini-games/bubble-pop-gacha',
    status: 'available',
    howToHtml:
      '<p>Pop for spy-craft secrets… Pop bubbles in sequence to unlock gacha rewards. Chain pops for rare items!</p>',
  },
  {
    id: 'rhythm-beat-em-up',
    title: 'Rhythm Beat-Em-Up',
    path: '/mini-games/rhythm-beat-em-up',
    status: 'available',
    howToHtml:
      "<p>Sync to the Moon Prism's pulse. Hit beats in four lanes to the rhythm. Perfect timing earns combos!</p>",
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    path: '/mini-games/memory-match',
    status: 'available',
    howToHtml:
      '<p>Simple pairs, endless fun. Find matching pairs in a simple grid. Perfect for quick sessions!</p>',
  },
  {
    id: 'petal-collection',
    title: 'Petal Collection',
    path: '/mini-games/petal-collection',
    status: 'available',
    howToHtml:
      '<p>Economy pacing prototype. Collect falling petals. Simple but effective for economy pacing!</p>',
  },
  {
    id: 'quick-math',
    title: 'Quick Math',
    path: '/mini-games/quick-math',
    status: 'available',
    howToHtml:
      '<p>Answer fast. Pressure builds with each correct streak. Solve math problems as quickly as possible!</p>',
  },
  {
    id: 'puzzle-reveal',
    title: 'Puzzle Reveal',
    path: '/mini-games/puzzle-reveal',
    status: 'available',
    howToHtml:
      '<p>Clear the fog to reveal the art. Watch your energy. Use different brush types to uncover hidden images!</p>',
  },
  {
    id: 'petal-samurai',
    title: 'Petal Samurai',
    path: '/mini-games/petal-samurai',
    status: 'available',
    howToHtml:
      '<p>Slash petals with style. Master storm and endless modes. Use precise timing to slice through petals!</p>',
  },
  {
    id: 'bubble-girl',
    title: 'Bubble Girl',
    path: '/mini-games/bubble-girl',
    status: 'available',
    howToHtml:
      '<p>Spawn bubbles, float and score. Sandbox or challenge mode. Create and pop bubbles in various game modes!</p>',
  },
  {
    id: 'bubble-ragdoll',
    title: 'Bubble Ragdoll',
    path: '/mini-games/bubble-ragdoll',
    status: 'available',
    howToHtml:
      '<p>Toss the ragdoll into bubbles. Survive the chaos. Physics-based fun with ragdoll characters!</p>',
  },
  {
    id: 'blossomware',
    title: 'Blossomware',
    path: '/mini-games/blossomware',
    status: 'available',
    howToHtml:
      '<p>Chaotic micro-sessions—keep your petal streak alive. Quick, intense gameplay sessions!</p>',
  },
  {
    id: 'dungeon-of-desire',
    title: 'Dungeon of Desire',
    path: '/mini-games/dungeon-of-desire',
    status: 'available',
    howToHtml:
      '<p>Descend into the dungeon. Survive rooms and claim rewards. Navigate through challenging dungeon levels!</p>',
  },
  {
    id: 'maid-cafe-manager',
    title: 'Maid Cafe Manager',
    path: '/mini-games/maid-cafe-manager',
    status: 'available',
    howToHtml:
      '<p>Manage shifts and keep guests smiling. Run your own maid cafe with strategic management!</p>',
  },
  {
    id: 'thigh-coliseum',
    title: 'Thigh Coliseum',
    path: '/mini-games/thigh-coliseum',
    status: 'available',
    howToHtml:
      '<p>Enter the arena. Win rounds and advance the bracket. Competitive arena-based gameplay!</p>',
  },
];

// Build-time duplicate guard (development only)
// This will be evaluated at build time, not runtime
if (typeof window === 'undefined' && env.NODE_ENV === 'development') {
  const ids = new Set<string>();
  const paths = new Set<string>();

  for (const game of games) {
    if (ids.has(game.id)) {
      throw new Error(`Duplicate game id detected: ${game.id}`);
    }
    if (paths.has(game.path)) {
      throw new Error(`Duplicate game path detected: ${game.path}`);
    }
    ids.add(game.id);
    paths.add(game.path);
  }
}

// Validation function
export function validateGame(game: unknown): Game {
  return GameSchema.parse(game);
}

// Helper functions
export function getGameById(id: string): Game | undefined {
  return games.find((game) => game.id === id);
}

export function getGameByPath(path: string): Game | undefined {
  return games.find((game) => game.path === path);
}

export function getAvailableGames(): Game[] {
  return games.filter((game) => game.status === 'available');
}

export function getGamesByStatus(status: 'available' | 'beta' | 'offline'): Game[] {
  return games.filter((game) => game.status === status);
}
