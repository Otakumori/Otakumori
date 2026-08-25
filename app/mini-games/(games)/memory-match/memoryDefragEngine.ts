export type MemoryDefragDifficulty = 'initiate' | 'keeper' | 'warden';

export type MemoryDefragPhase = 'ready' | 'playing' | 'resolving' | 'paused' | 'won';

export type MemoryCardState = 'hidden' | 'revealed' | 'matched';

export interface MemoryFace {
  id: string;
  label: string;
  shortLabel: string;
  tone: 'rose' | 'bronze' | 'ivory' | 'bark' | 'stone';
}

export interface MemoryCard {
  id: string;
  pairId: string;
  face: MemoryFace;
  state: MemoryCardState;
}

export interface MemoryDefragConfig {
  difficulty: MemoryDefragDifficulty;
  label: string;
  rows: number;
  columns: number;
  pairs: number;
  mismatchDelayMs: number;
  parMoves: number;
}

export interface MemoryDefragPlayerPresentation {
  playerId?: string;
  displayName?: string;
  title?: string;
  publicAvatarUrl?: string;
  cosmeticLoadoutId?: string;
}

export interface MemoryDefragState {
  cards: MemoryCard[];
  difficulty: MemoryDefragDifficulty;
  phase: MemoryDefragPhase;
  pausedFrom?: Exclude<MemoryDefragPhase, 'paused' | 'ready' | 'won'>;
  revealedIds: string[];
  matchedPairs: number;
  moves: number;
  streak: number;
  bestStreak: number;
  elapsedMs: number;
  lastActiveAtMs: number | null;
  pendingMismatch?: {
    ids: [string, string];
    resolveAtMs: number;
  };
  seed: string;
  lastEvent:
    | 'created'
    | 'first-reveal'
    | 'match'
    | 'mismatch'
    | 'resolved'
    | 'ignored'
    | 'paused'
    | 'resumed'
    | 'won';
}

export interface MemoryDefragCompletionFacts {
  gameId: 'memory-match';
  completed: true;
  difficulty: MemoryDefragDifficulty;
  score: number;
  moves: number;
  elapsedMs: number;
  matchedPairs: number;
  perfectClear: boolean;
  lowMoveClear: boolean;
  bestStreak: number;
  seed: string;
}

export interface MemoryDefragRewardIntent {
  kind: 'mini-game-completion';
  economyAuthority: 'external';
  facts: MemoryDefragCompletionFacts;
}

export interface MemoryDefragAchievementIntent {
  kind: 'achievement-facts';
  facts: Array<
    | 'memory_defrag_first_clear'
    | 'memory_defrag_perfect_clear'
    | 'memory_defrag_low_move_clear'
    | 'memory_defrag_full_streak'
  >;
}

export const MEMORY_DEFRAG_CONFIGS: Record<MemoryDefragDifficulty, MemoryDefragConfig> = {
  initiate: {
    difficulty: 'initiate',
    label: 'Initiate',
    rows: 3,
    columns: 4,
    pairs: 6,
    mismatchDelayMs: 760,
    parMoves: 10,
  },
  keeper: {
    difficulty: 'keeper',
    label: 'Keeper',
    rows: 4,
    columns: 4,
    pairs: 8,
    mismatchDelayMs: 860,
    parMoves: 14,
  },
  warden: {
    difficulty: 'warden',
    label: 'Warden',
    rows: 4,
    columns: 5,
    pairs: 10,
    mismatchDelayMs: 920,
    parMoves: 18,
  },
};

export const MEMORY_FACES: MemoryFace[] = [
  { id: 'blossom', label: 'Pressed blossom', shortLabel: 'BLM', tone: 'rose' },
  { id: 'pouch', label: 'Petal pouch', shortLabel: 'PCH', tone: 'bronze' },
  { id: 'reliquary', label: 'Reliquary shard', shortLabel: 'RLC', tone: 'ivory' },
  { id: 'medallion', label: 'Traveler medallion', shortLabel: 'MDL', tone: 'bronze' },
  { id: 'soapstone', label: 'Carved soapstone', shortLabel: 'STN', tone: 'stone' },
  { id: 'root', label: 'Root sigil', shortLabel: 'RTS', tone: 'bark' },
  { id: 'lantern', label: 'Shrine lantern', shortLabel: 'LNT', tone: 'ivory' },
  { id: 'mirror', label: 'Clouded mirror', shortLabel: 'MIR', tone: 'stone' },
  { id: 'thread', label: 'Red thread spool', shortLabel: 'THR', tone: 'rose' },
  { id: 'mask', label: 'Quiet mask', shortLabel: 'MSK', tone: 'bark' },
];

export function createMemoryDefragGame(options?: {
  difficulty?: MemoryDefragDifficulty;
  seed?: string;
  nowMs?: number;
}): MemoryDefragState {
  const difficulty = options?.difficulty ?? 'keeper';
  const config = MEMORY_DEFRAG_CONFIGS[difficulty];
  const seed = options?.seed ?? `${difficulty}-${Date.now()}`;
  const cards = shuffleCards(buildCards(config), seed);
  const nowMs = options?.nowMs ?? 0;

  return {
    cards,
    difficulty,
    phase: 'ready',
    revealedIds: [],
    matchedPairs: 0,
    moves: 0,
    streak: 0,
    bestStreak: 0,
    elapsedMs: 0,
    lastActiveAtMs: nowMs,
    seed,
    lastEvent: 'created',
  };
}

export function revealMemoryCard(
  state: MemoryDefragState,
  cardId: string,
  nowMs: number,
): MemoryDefragState {
  const active = settleTimedState(updateElapsed(state, nowMs), nowMs);

  if (active.phase === 'paused' || active.phase === 'won' || active.phase === 'resolving') {
    return { ...active, lastEvent: 'ignored' };
  }

  const card = active.cards.find((candidate) => candidate.id === cardId);
  if (!card || card.state !== 'hidden' || active.revealedIds.includes(cardId)) {
    return { ...active, lastEvent: 'ignored' };
  }

  const cards = active.cards.map((candidate) =>
    candidate.id === cardId ? { ...candidate, state: 'revealed' as const } : candidate,
  );
  const revealedIds = [...active.revealedIds, cardId];

  if (revealedIds.length === 1) {
    return {
      ...active,
      cards,
      phase: 'playing',
      revealedIds,
      lastActiveAtMs: nowMs,
      lastEvent: 'first-reveal',
    };
  }

  if (revealedIds.length !== 2) {
    return { ...active, cards, revealedIds, lastActiveAtMs: nowMs, lastEvent: 'ignored' };
  }

  const [firstId, secondId] = revealedIds;
  const first = cards.find((candidate) => candidate.id === firstId);
  const second = cards.find((candidate) => candidate.id === secondId);
  const config = MEMORY_DEFRAG_CONFIGS[active.difficulty];
  const moves = active.moves + 1;

  if (first && second && first.pairId === second.pairId && first.id !== second.id) {
    const matchedCards = cards.map((candidate) =>
      candidate.id === firstId || candidate.id === secondId
        ? { ...candidate, state: 'matched' as const }
        : candidate,
    );
    const matchedPairs = active.matchedPairs + 1;
    const streak = active.streak + 1;
    const bestStreak = Math.max(active.bestStreak, streak);
    const won = matchedPairs === config.pairs;

    return {
      ...active,
      cards: matchedCards,
      phase: won ? 'won' : 'playing',
      revealedIds: [],
      matchedPairs,
      moves,
      streak,
      bestStreak,
      lastActiveAtMs: won ? null : nowMs,
      lastEvent: won ? 'won' : 'match',
    };
  }

  return {
    ...active,
    cards,
    phase: 'resolving',
    revealedIds,
    moves,
    streak: 0,
    pendingMismatch: {
      ids: [firstId, secondId],
      resolveAtMs: active.elapsedMs + config.mismatchDelayMs,
    },
    lastActiveAtMs: nowMs,
    lastEvent: 'mismatch',
  };
}

export function resolveMemoryMismatch(
  state: MemoryDefragState,
  nowMs: number,
): MemoryDefragState {
  const active = updateElapsed(state, nowMs);
  if (!active.pendingMismatch) {
    return active;
  }

  const [firstId, secondId] = active.pendingMismatch.ids;
  return {
    ...active,
    cards: active.cards.map((card) =>
      card.id === firstId || card.id === secondId ? { ...card, state: 'hidden' as const } : card,
    ),
    phase: active.phase === 'paused' ? 'paused' : 'playing',
    revealedIds: [],
    pendingMismatch: undefined,
    lastActiveAtMs: active.phase === 'paused' ? null : nowMs,
    lastEvent: 'resolved',
  };
}

export function settleTimedState(state: MemoryDefragState, nowMs: number): MemoryDefragState {
  const active = updateElapsed(state, nowMs);
  if (
    active.pendingMismatch &&
    active.phase !== 'paused' &&
    active.elapsedMs >= active.pendingMismatch.resolveAtMs
  ) {
    return resolveMemoryMismatch(active, nowMs);
  }
  return active;
}

export function pauseMemoryDefrag(
  state: MemoryDefragState,
  nowMs: number,
): MemoryDefragState {
  const active = updateElapsed(state, nowMs);
  if (active.phase === 'paused' || active.phase === 'won' || active.phase === 'ready') {
    return active;
  }

  return {
    ...active,
    phase: 'paused',
    pausedFrom: active.phase,
    lastActiveAtMs: null,
    lastEvent: 'paused',
  };
}

export function resumeMemoryDefrag(
  state: MemoryDefragState,
  nowMs: number,
): MemoryDefragState {
  if (state.phase !== 'paused') {
    return state;
  }

  return {
    ...state,
    phase: state.pausedFrom ?? 'playing',
    pausedFrom: undefined,
    lastActiveAtMs: nowMs,
    lastEvent: 'resumed',
  };
}

export function getMemoryDefragElapsedMs(state: MemoryDefragState, nowMs: number): number {
  return updateElapsed(state, nowMs).elapsedMs;
}

export function getMemoryDefragScore(state: MemoryDefragState, nowMs: number): number {
  const elapsedSeconds = Math.floor(getMemoryDefragElapsedMs(state, nowMs) / 1000);
  const config = MEMORY_DEFRAG_CONFIGS[state.difficulty];
  const matchScore = state.matchedPairs * 140;
  const streakScore = state.bestStreak * 35;
  const moveBonus = Math.max(0, config.parMoves - state.moves) * 22;
  const timeBonus = state.phase === 'won' ? Math.max(0, 240 - elapsedSeconds) : 0;
  return Math.max(0, matchScore + streakScore + moveBonus + timeBonus);
}

export function getMemoryDefragProgress(state: MemoryDefragState): number {
  const config = MEMORY_DEFRAG_CONFIGS[state.difficulty];
  return state.matchedPairs / config.pairs;
}

export function buildMemoryDefragCompletionFacts(
  state: MemoryDefragState,
  nowMs: number,
): MemoryDefragCompletionFacts | null {
  if (state.phase !== 'won') {
    return null;
  }

  const config = MEMORY_DEFRAG_CONFIGS[state.difficulty];
  const elapsedMs = getMemoryDefragElapsedMs(state, nowMs);
  const perfectClear = state.moves === config.pairs;
  const lowMoveClear = state.moves <= config.parMoves;

  return {
    gameId: 'memory-match',
    completed: true,
    difficulty: state.difficulty,
    score: getMemoryDefragScore(state, nowMs),
    moves: state.moves,
    elapsedMs,
    matchedPairs: state.matchedPairs,
    perfectClear,
    lowMoveClear,
    bestStreak: state.bestStreak,
    seed: state.seed,
  };
}

export function buildMemoryDefragRewardIntent(
  state: MemoryDefragState,
  nowMs: number,
): MemoryDefragRewardIntent | null {
  const facts = buildMemoryDefragCompletionFacts(state, nowMs);
  return facts ? { kind: 'mini-game-completion', economyAuthority: 'external', facts } : null;
}

export function buildMemoryDefragAchievementIntent(
  state: MemoryDefragState,
  nowMs: number,
): MemoryDefragAchievementIntent | null {
  const facts = buildMemoryDefragCompletionFacts(state, nowMs);
  if (!facts) return null;

  const achievementFacts: MemoryDefragAchievementIntent['facts'] = [
    'memory_defrag_first_clear',
  ];

  if (facts.perfectClear) achievementFacts.push('memory_defrag_perfect_clear');
  if (facts.lowMoveClear) achievementFacts.push('memory_defrag_low_move_clear');
  if (facts.bestStreak === MEMORY_DEFRAG_CONFIGS[state.difficulty].pairs) {
    achievementFacts.push('memory_defrag_full_streak');
  }

  return { kind: 'achievement-facts', facts: achievementFacts };
}

function buildCards(config: MemoryDefragConfig): MemoryCard[] {
  return MEMORY_FACES.slice(0, config.pairs).flatMap((face) => [
    {
      id: `${face.id}-a`,
      pairId: face.id,
      face,
      state: 'hidden' as const,
    },
    {
      id: `${face.id}-b`,
      pairId: face.id,
      face,
      state: 'hidden' as const,
    },
  ]);
}

function shuffleCards(cards: MemoryCard[], seed: string): MemoryCard[] {
  const rng = createSeededRng(seed);
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function updateElapsed(state: MemoryDefragState, nowMs: number): MemoryDefragState {
  if (state.lastActiveAtMs === null || state.phase === 'paused' || state.phase === 'won') {
    return state;
  }

  const delta = Math.max(0, nowMs - state.lastActiveAtMs);
  if (delta === 0) return state;

  return {
    ...state,
    elapsedMs: state.elapsedMs + delta,
    lastActiveAtMs: nowMs,
  };
}

function createSeededRng(seed: string): () => number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return () => {
    hash += 0x6d2b79f5;
    let value = hash;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
