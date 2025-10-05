import { GAMES, type GameDefinition } from './registry.safe';

// Map registry games to hub component props
export interface HubGameCard {
  slug: string;
  title: string;
  description: string;
  available: boolean;
  howToHtml?: string;
}

export interface HubFaceLabels {
  top: string;
  right: string;
  bottom: string;
  left: string;
  center: string;
}

// GameCube Hub Labels
export const HUB_LABELS: HubFaceLabels = {
  top: 'Action',
  right: 'Puzzle',
  bottom: 'Strategy',
  left: 'All Games',
  center: 'OTAKU-MORI',
};

// Convert registry games to hub cards
export function getHubGameCards(): HubGameCard[] {
  return GAMES.map((game: GameDefinition) => ({
    slug: game.id,
    title: game.title,
    description: getGameDescription(game.id),
    available: game.status === 'ready',
    howToHtml: game.howToHtml,
  }));
}

// Get games by category for different hub faces
export function getActionGames(): HubGameCard[] {
  const actionGameIds = [
    'samurai-petal-slice',
    'otaku-beat-em-up',
    'petal-samurai',
    'thigh-coliseum',
    'dungeon-of-desire',
  ];
  return getHubGameCards().filter((game) => actionGameIds.includes(game.slug));
}

export function getPuzzleGames(): HubGameCard[] {
  const puzzleGameIds = [
    'memory',
    'memory-match',
    'anime-memory-match',
    'puzzle-reveal',
    'quick-math',
  ];
  return getHubGameCards().filter((game) => puzzleGameIds.includes(game.slug));
}

export function getStrategyGames(): HubGameCard[] {
  const strategyGameIds = ['maid-cafe-manager', 'bubble-pop-gacha', 'blossomware'];
  return getHubGameCards().filter((game) => strategyGameIds.includes(game.slug));
}

// Get all games for "All Games" face
export function getAllGames(): HubGameCard[] {
  return getHubGameCards();
}

// Helper to get game descriptions (fallback to title if no specific description)
function getGameDescription(gameId: string): string {
  const descriptions: Record<string, string> = {
    'samurai-petal-slice': "Draw the Tetsusaiga's arc…",
    'anime-memory-match': 'Recall the faces bound by fate.',
    'bubble-pop-gacha': 'Pop for spy-craft secrets…',
    'otaku-beat-em-up': "Sync to the Moon Prism's pulse.",
    'memory-match': 'Simple pairs, endless fun.',
    'petal-collection': 'Economy pacing prototype.',
    'quick-math': 'Answer fast. Pressure builds with each correct streak.',
    'puzzle-reveal': 'Clear the fog to reveal the art. Watch your energy.',
    'petal-samurai': 'Slash petals with style. Master storm and endless modes.',
    'bubble-girl': 'Spawn bubbles, float and score. Sandbox or challenge mode.',
    'bubble-ragdoll': 'Toss the ragdoll into bubbles. Survive the chaos.',
    blossomware: 'Chaotic micro-sessions—keep your petal streak alive.',
    'dungeon-of-desire': 'Descend into the dungeon. Survive rooms and claim rewards.',
    'maid-cafe-manager': 'Manage shifts and keep guests smiling.',
    'thigh-coliseum': 'Enter the arena. Win rounds and advance the bracket.',
  };

  return descriptions[gameId] || 'Play and collect petals!';
}

// Get games by face
export function getGamesByFace(face: keyof HubFaceLabels): HubGameCard[] {
  switch (face) {
    case 'top':
      return getActionGames();
    case 'right':
      return getPuzzleGames();
    case 'bottom':
      return getStrategyGames();
    case 'left':
      return getAllGames();
    default:
      return [];
  }
}
