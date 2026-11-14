export const SECONDARY_GAME_IDS = [
  'bubble-ragdoll',
  'puzzle-reveal',
  'thigh-coliseum',
  'dungeon-of-desire',
  'maid-cafe-manager',
] as const;

export type SecondaryGameId = (typeof SECONDARY_GAME_IDS)[number];

export function canonicalSecondaryGameId(id: string): SecondaryGameId | null {
  if (id === 'bubble-girl') return 'bubble-ragdoll';
  return SECONDARY_GAME_IDS.includes(id as SecondaryGameId) ? (id as SecondaryGameId) : null;
}

export type BubbleObjective = {
  id: 'pop-12' | 'combo-6' | 'score-1800';
  label: string;
  isComplete: (facts: { pops: number; combo: number; score: number }) => boolean;
};

export const BUBBLE_OBJECTIVES: readonly BubbleObjective[] = [
  { id: 'pop-12', label: 'Pop 12 bubbles', isComplete: ({ pops }) => pops >= 12 },
  { id: 'combo-6', label: 'Build a 6-pop combo', isComplete: ({ combo }) => combo >= 6 },
  { id: 'score-1800', label: 'Reach 1,800 points', isComplete: ({ score }) => score >= 1800 },
];

export function bubbleObjectiveForRun(runIndex: number): BubbleObjective {
  return BUBBLE_OBJECTIVES[Math.abs(Math.trunc(runIndex)) % BUBBLE_OBJECTIVES.length]!;
}

export function nextPuzzleContentIndex(currentIndex: number | null, seed: number, count: number) {
  if (count <= 0) return null;
  if (count === 1) return 0;
  const candidate = Math.abs(Math.trunc(seed)) % count;
  return candidate === currentIndex ? (candidate + 1) % count : candidate;
}

export const THIGH_TARGET_DISTANCE = 10_000;
export const DUNGEON_FINAL_FLOOR = 10;
export const MAID_SHIFT_MS = 120_000;
export const MAID_RUSH_START_MS = 90_000;

export function dungeonEnemyGrammar(
  floor: number,
  slot: number,
): 'succubus' | 'wraith' | 'demon_lord' {
  if (floor === DUNGEON_FINAL_FLOOR && slot === 0) return 'demon_lord';
  if (floor >= 4 && (floor + slot) % 3 === 0) return 'wraith';
  return floor >= 5 && slot % 4 === 0 ? 'demon_lord' : 'succubus';
}

export function maidShiftPhase(elapsedMs: number) {
  if (elapsedMs >= MAID_SHIFT_MS) return 'complete' as const;
  if (elapsedMs >= MAID_RUSH_START_MS) return 'rush' as const;
  return 'service' as const;
}
