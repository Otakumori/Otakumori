export type BeatEmUpMode = 'story' | 'arcade' | 'survival';
export type BeatEmUpEnemyType = 'grunt' | 'brute' | 'ninja' | 'boss';

export interface BeatEmUpSpawnDirective {
  type: BeatEmUpEnemyType;
  delayMs: number;
  movement: 'vanguard' | 'boss-reveal' | 'support';
}

export const STORY_MAX_WAVES = 10;

const STORY_CLIMAX: readonly BeatEmUpSpawnDirective[] = [
  { type: 'ninja', delayMs: 0, movement: 'vanguard' },
  { type: 'brute', delayMs: 350, movement: 'vanguard' },
  { type: 'ninja', delayMs: 700, movement: 'vanguard' },
  { type: 'boss', delayMs: 2600, movement: 'boss-reveal' },
  { type: 'grunt', delayMs: 2950, movement: 'support' },
  { type: 'brute', delayMs: 3300, movement: 'support' },
];

export function isStoryClimaxWave(mode: BeatEmUpMode, wave: number): boolean {
  return mode === 'story' && wave === STORY_MAX_WAVES;
}

export function shouldCompleteStoryRun(mode: BeatEmUpMode, clearedWave: number): boolean {
  return mode === 'story' && clearedWave >= STORY_MAX_WAVES;
}

export function getWaveEncounterPlan(
  mode: BeatEmUpMode,
  wave: number,
  random: () => number = Math.random,
): BeatEmUpSpawnDirective[] {
  if (isStoryClimaxWave(mode, wave)) return STORY_CLIMAX.map((spawn) => ({ ...spawn }));

  const count = Math.min(3 + wave, 8);
  return Array.from({ length: count }, (_, index) => {
    let type: BeatEmUpEnemyType;
    if (wave % 5 === 0 && index === count - 1) type = 'boss';
    else if (wave % 3 === 0 && random() < 0.3) type = 'brute';
    else if (random() < 0.4) type = 'ninja';
    else type = 'grunt';

    return { type, delayMs: index * 300, movement: 'support' };
  });
}

export type BeatEmUpRunGrade = 'C' | 'B' | 'A' | 'S';

const GRADE_THRESHOLDS: Record<BeatEmUpMode, readonly [number, number, number]> = {
  story: [10_000, 25_000, 45_000],
  arcade: [8_000, 20_000, 40_000],
  survival: [12_000, 30_000, 60_000],
};

export function getBeatEmUpRunGrade(mode: BeatEmUpMode, score: number): BeatEmUpRunGrade {
  const [b, a, s] = GRADE_THRESHOLDS[mode];
  if (score >= s) return 'S';
  if (score >= a) return 'A';
  if (score >= b) return 'B';
  return 'C';
}
