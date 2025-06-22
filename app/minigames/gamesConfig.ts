export type GameConfig = {
  id: string;
  title: string;
  description: string;
  icon: string; // Path to icon image
  audio: string; // Path to audio file
  nsfw: boolean;
  comingSoon?: boolean;
};

export const games: GameConfig[] = [
  {
    id: 'petal-samurai',
    title: 'Petal Samurai',
    description: 'Slice petals mid-air in a calm, animated rhythm game.',
    icon: '/images/games/petal-samurai.png',
    audio: '/sounds/games/petal-samurai.mp3',
    nsfw: false,
  },
  {
    id: 'puzzle-reveal',
    title: 'Puzzle Reveal',
    description: 'Solve logic/image puzzles to unlock lore and cosmetics.',
    icon: '/images/games/puzzle-reveal.png',
    audio: '/sounds/games/puzzle-reveal.mp3',
    nsfw: false,
  },
  {
    id: 'brick-breaker',
    title: 'Brick Breaker',
    description: 'Classic paddle game with Otaku-mori theming.',
    icon: '/images/games/brick-breaker.png',
    audio: '/sounds/games/brick-breaker.mp3',
    nsfw: false,
  },
  {
    id: 'bubble-girl',
    title: 'Bubble Girl',
    description: 'Float and pop bubbles in escalating NSFW-friendly challenges.',
    icon: '/images/games/bubble-girl.png',
    audio: '/sounds/games/bubble-girl.mp3',
    nsfw: true,
  },
  {
    id: 'memory-matrix',
    title: 'Memory Matrix',
    description: 'Flip matching cards to reveal secrets and emotes.',
    icon: '/images/games/memory-matrix.png',
    audio: '/sounds/games/memory-matrix.mp3',
    nsfw: true,
  },
  {
    id: 'glitch-crawl',
    title: 'Glitch Crawl',
    description: 'Platformer through a glitched data world. Collect shards and decrypt files.',
    icon: '/images/games/glitch-crawl.png',
    audio: '/sounds/games/glitch-crawl.mp3',
    nsfw: false,
  },
  {
    id: 'thighs-of-time',
    title: 'Thighs of Time',
    description: 'Rhythm game with dancing waifus/hunks and unlockable moves.',
    icon: '/images/games/thighs-of-time.png',
    audio: '/sounds/games/thighs-of-time.mp3',
    nsfw: true,
  },
  {
    id: 'bento-boss',
    title: 'Bento Boss',
    description: 'Stacking puzzle to build aesthetic bento boxes for anime customers.',
    icon: '/images/games/bento-boss.png',
    audio: '/sounds/games/bento-boss.mp3',
    nsfw: false,
  },
  {
    id: 'love-letter-duel',
    title: 'Love Letter Duel',
    description: 'Assemble poetic anime messages and compete for romance.',
    icon: '/images/games/love-letter-duel.png',
    audio: '/sounds/games/love-letter-duel.mp3',
    nsfw: false,
  },
  {
    id: 'maid-mayhem',
    title: 'Maid Mayhem',
    description: 'Time management chaos in a flustered maid/butler cafe.',
    icon: '/images/games/maid-mayhem.png',
    audio: '/sounds/games/maid-mayhem.mp3',
    nsfw: true,
  },
  {
    id: 'otaku-drift',
    title: 'Otaku Drift',
    description: 'Drift hover-scooters through anime-themed lanes.',
    icon: '/images/games/otaku-drift.png',
    audio: '/sounds/games/otaku-drift.mp3',
    nsfw: false,
  },
  {
    id: 'rune-alchemy',
    title: 'Rune Alchemy',
    description: 'Match-3 puzzle with runes, buffs, and crafting integration.',
    icon: '/images/games/rune-alchemy.png',
    audio: '/sounds/games/rune-alchemy.mp3',
    nsfw: false,
  },
  // Add more games as needed
];
