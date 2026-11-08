/**
 * Shared Game Progress Service
 *
 * Centralized service for recording game results, calculating petal rewards,
 * and checking achievements. Wraps existing API endpoints and provides a
 * consistent interface for all mini-games.
 */

'use client';

import { useCallback, useRef } from 'react';

import { calculateGameReward } from '@/app/config/petalTuning';
import { usePetalEarn } from '@/app/mini-games/_shared/usePetalEarn';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

export interface GameResultMetadata {
  combo?: number;
  accuracy?: number;
  wavesCleared?: number;
  timeElapsed?: number;
  difficulty?: string;
  mode?: string;
  [key: string]: unknown;
}

export interface GameResult {
  gameId: string;
  sessionId?: string;
  resultKey?: string;
  score: number;
  difficulty: string;
  durationMs: number;
  didWin: boolean;
  metadata?: GameResultMetadata;
}

export interface PetalRewardResult {
  earned: number;
  balance: number;
  lifetimePetalsEarned: number;
  isGuest: boolean;
  dailyCapReached?: boolean;
  duplicate?: boolean;
  status: 'awarded' | 'duplicate' | 'unavailable';
}

export interface AchievementCheckResult {
  unlocked: string[]; // Achievement codes that were unlocked
  rewards: Array<{
    code: string;
    name: string;
    rewardType?: string;
    rewardAmount?: number;
  }>;
}

export interface RecordGameResultResponse {
  success: boolean;
  petalReward?: PetalRewardResult;
  personalBest?: PersonalBestResult;
  achievements?: AchievementCheckResult;
  error?: string;
}

export interface PersonalBestResult {
  status: 'new_best' | 'unchanged' | 'unavailable';
  previousBest: number | null;
  currentBest: number | null;
  isNewBest: boolean;
}

export async function recordPersonalBest(input: {
  gameId: string;
  resultKey: string;
  score: number;
  metadata?: GameResultMetadata;
}): Promise<PersonalBestResult> {
  try {
    const response = await fetch('/api/v1/games/personal-best', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok || payload.data?.persisted !== true) {
      return { status: 'unavailable', previousBest: null, currentBest: null, isNewBest: false };
    }

    return {
      status: payload.data.isNewBest ? 'new_best' : 'unchanged',
      previousBest: payload.data.previousBest,
      currentBest: payload.data.currentBest,
      isNewBest: payload.data.isNewBest,
    };
  } catch {
    return { status: 'unavailable', previousBest: null, currentBest: null, isNewBest: false };
  }
}

export function createGameResultSessionId(gameId: string): string {
  const randomId =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${gameId}:${randomId}`;
}

/**
 * Calculate petal reward for a game result
 * Wraps the existing calculateGameReward function from petalTuning
 */
export function calculatePetalReward(
  gameId: string,
  score: number,
  difficulty: string,
  metadata?: GameResultMetadata,
  didWin: boolean = true,
): number {
  return calculateGameReward(gameId, didWin, score, metadata);
}

/**
 * Check and unlock achievements based on game result
 * Calls the achievement unlock API for each achievement that should be unlocked
 */
export async function checkAchievements(
  gameId: string,
  score: number,
  metadata?: GameResultMetadata,
): Promise<AchievementCheckResult> {
  const unlocked: string[] = [];
  const rewards: AchievementCheckResult['rewards'] = [];

  // TODO: Implement achievement checking logic
  // This should check game-specific achievement conditions and call /api/v1/achievements/unlock
  // For now, return empty result - this will be implemented based on achievement definitions

  // Example structure for future implementation:
  // const achievementChecks = getAchievementChecksForGame(gameId);
  // for (const check of achievementChecks) {
  //   if (check.condition(score, metadata)) {
  //     const result = await unlockAchievement(check.code);
  //     if (result.success) {
  //       unlocked.push(check.code);
  //       rewards.push({
  //         code: check.code,
  //         name: result.name,
  //         rewardType: result.rewardType,
  //         rewardAmount: result.rewardAmount,
  //       });
  //     }
  //   }
  // }

  return { unlocked, rewards };
}

/**
 * Unlock a single achievement
 * Helper function for checkAchievements
 */
async function unlockAchievement(
  achievementCode: string,
  idempotencyKey: string,
): Promise<{
  success: boolean;
  name?: string;
  rewardType?: string;
  rewardAmount?: number;
  error?: string;
}> {
  try {
    const response = await fetch('/api/v1/achievements/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        achievementCode,
        idempotencyKey,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      return {
        success: false,
        error: data.error || 'Failed to unlock achievement',
      };
    }

    return {
      success: true,
      name: data.data?.achievementName,
      rewardType: data.data?.rewardDetails?.type,
      rewardAmount: data.data?.rewardDetails?.amount,
    };
  } catch (error) {
    getLogger().then((logger) => {
      logger.error(
        'Error unlocking achievement:',
        undefined,
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Record a game result and handle petal rewards and achievements
 * This is the main function that games should call when a game ends
 *
 * @param result - Game result data
 * @param earnPetalsFn - Function from usePetalEarn hook to earn petals
 * @returns Combined result with petal rewards and achievements
 */
export async function recordGameResult(
  result: GameResult,
  earnPetalsFn: (request: {
    gameId: string;
    sessionId?: string;
    score: number;
    didWin?: boolean;
    metadata?: GameResultMetadata;
  }) => Promise<{
    success: boolean;
    earned: number;
    balance: number;
    lifetimePetalsEarned: number;
    isGuest: boolean;
    dailyCapReached?: boolean;
    duplicate?: boolean;
    status: 'awarded' | 'duplicate' | 'unavailable';
    error?: string;
  }>,
): Promise<RecordGameResultResponse> {
  try {
    const resultKey = result.resultKey ?? result.difficulty;
    const [petalResult, personalBest] = await Promise.all([
      earnPetalsFn({
        gameId: result.gameId,
        sessionId: result.sessionId,
        score: result.score,
        didWin: result.didWin,
        metadata: result.metadata,
      }),
      recordPersonalBest({
        gameId: result.gameId,
        resultKey,
        score: result.score,
        metadata: result.metadata,
      }),
    ]);

    if (!petalResult.success) {
      return {
        success: false,
        personalBest,
        error: petalResult.error || 'Failed to record game result',
      };
    }

    // Check and unlock achievements
    const achievementResult = await checkAchievements(result.gameId, result.score, result.metadata);

    return {
      success: true,
      petalReward: {
        earned: petalResult.earned,
        balance: petalResult.balance,
        lifetimePetalsEarned: petalResult.lifetimePetalsEarned,
        isGuest: petalResult.isGuest,
        dailyCapReached: petalResult.dailyCapReached,
        duplicate: petalResult.duplicate,
        status: petalResult.status,
      },
      personalBest,
      achievements: achievementResult,
    };
  } catch (error) {
    getLogger().then((logger) => {
      logger.error(
        'Error recording game result:',
        undefined,
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Hook for using the game progress service in React components
 * Provides easy access to recordGameResult with the earnPetals function
 */
export function useGameProgress() {
  const { earnPetals } = usePetalEarn();
  const sessionIdRef = useRef(createGameResultSessionId('game'));

  const beginResultSession = useCallback((gameId: string) => {
    const sessionId = createGameResultSessionId(gameId);
    sessionIdRef.current = sessionId;
    return sessionId;
  }, []);

  const recordResult = useCallback(
    async (result: GameResult): Promise<RecordGameResultResponse> =>
      recordGameResult(
        { ...result, sessionId: result.sessionId ?? sessionIdRef.current },
        earnPetals,
      ),
    [earnPetals],
  );

  return {
    beginResultSession,
    recordResult,
    recordPersonalBest,
    calculatePetalReward: (
      gameId: string,
      score: number,
      difficulty: string,
      metadata?: GameResultMetadata,
      didWin?: boolean,
    ) => calculatePetalReward(gameId, score, difficulty, metadata, didWin),
    checkAchievements: (gameId: string, score: number, metadata?: GameResultMetadata) =>
      checkAchievements(gameId, score, metadata),
  };
}
