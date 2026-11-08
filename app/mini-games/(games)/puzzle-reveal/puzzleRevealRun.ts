export interface PuzzleRevealRunProgress {
  totalTiles: number;
  tilesRevealed: number;
  score: number;
  completionScheduled: boolean;
  completed: boolean;
}

export interface PuzzleRevealTileResult {
  progress: PuzzleRevealRunProgress;
  accepted: boolean;
  shouldComplete: boolean;
}

export function createPuzzleRevealRun(totalTiles: number): PuzzleRevealRunProgress {
  return {
    totalTiles: Math.max(0, Math.floor(totalTiles)),
    tilesRevealed: 0,
    score: 0,
    completionScheduled: false,
    completed: false,
  };
}

export function recordPuzzleRevealTile(
  current: PuzzleRevealRunProgress,
  tileScore: number,
): PuzzleRevealTileResult {
  if (
    current.totalTiles <= 0 ||
    current.completionScheduled ||
    current.completed ||
    !Number.isFinite(tileScore) ||
    tileScore < 0
  ) {
    return { progress: current, accepted: false, shouldComplete: false };
  }

  const tilesRevealed = Math.min(current.totalTiles, current.tilesRevealed + 1);
  const shouldComplete = tilesRevealed === current.totalTiles;
  const progress = {
    ...current,
    tilesRevealed,
    score: current.score + tileScore,
    completionScheduled: shouldComplete,
  };

  return { progress, accepted: true, shouldComplete };
}

export function completePuzzleRevealRun(current: PuzzleRevealRunProgress): {
  progress: PuzzleRevealRunProgress;
  didComplete: boolean;
} {
  if (!current.completionScheduled || current.completed) {
    return { progress: current, didComplete: false };
  }

  return {
    progress: { ...current, completed: true },
    didComplete: true,
  };
}
