/**
 * Universal Game Engine Hook
 *
 * Provides unified game functionality:
 * - Save/Load system
 * - Achievement tracking
 * - Leaderboard submission
 * - Petal economy integration
 * - Performance monitoring
 * - Anti-cheat validation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface GameState {
  level: number;
  score: number;
  lives: number;
  powerups: string[];
  inventory: Record<string, number>;
  settings: Record<string, any>;
  progress: Record<string, any>;
  metadata: {
    playtime: number;
    startedAt: string;
    lastSaved: string;
    version: number;
  };
}

export interface GameSession {
  sessionId: string;
  gameId: string;
  startTime: number;
  currentScore: number;
  actions: Array<{
    type: string;
    timestamp: number;
    data: any;
  }>;
  checksum: string;
}

export interface UseGameEngineOptions {
  gameId: string;
  autoSave?: boolean;
  autoSaveInterval?: number; // milliseconds
  enableAchievements?: boolean;
  enableLeaderboards?: boolean;
  enablePetals?: boolean;
  maxActions?: number; // for anti-cheat
}

export interface GameEngineReturn {
  // Game State
  gameState: GameState | null;
  isLoading: boolean;
  lastSaved: Date | null;

  // Save/Load
  saveGame: (slot?: number) => Promise<void>;
  loadGame: (slot?: number) => Promise<GameState | null>;
  resetGame: () => void;

  // Score & Progress
  updateScore: (score: number, metadata?: any) => void;
  updateProgress: (progress: Partial<GameState>) => void;

  // Achievements
  unlockAchievement: (achievementId: string, progress?: number, metadata?: any) => Promise<void>;
  checkAchievements: (gameState: GameState) => Promise<void>;

  // Leaderboards
  submitScore: (
    category: 'score' | 'time' | 'level',
    score: number,
    metadata?: any,
  ) => Promise<void>;

  // Petals
  awardPetals: (amount: number, reason: string) => Promise<void>;
  spendPetals: (amount: number, reason: string) => Promise<void>;

  // Session Management
  startSession: () => string;
  endSession: () => Promise<void>;
  recordAction: (type: string, data: any) => void;

  // Performance
  trackMetric: (name: string, value: number, tags?: Record<string, string>) => void;

  // Utilities
  generateChecksum: (data: any) => string;
  validateSession: () => boolean;
}

export function useGameEngine(options: UseGameEngineOptions): GameEngineReturn {
  const {
    gameId,
    autoSave = true,
    autoSaveInterval = 30000,
    enableAchievements = true,
    enableLeaderboards = true,
    enablePetals = true,
    maxActions = 1000,
  } = options;

  const { userId, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Refs for auto-save and session tracking
  const autoSaveIntervalRef = useRef<any>(undefined);
  const sessionStartRef = useRef<number>(0);

  // Load game state
  const { data: loadedGame, isLoading } = useQuery({
    queryKey: ['game-save', gameId, userId],
    queryFn: async () => {
      if (!isSignedIn || !userId) return null;

      const response = await fetch(`/api/v1/games/${gameId}/save`);
      if (!response.ok) return null;

      const result = await response.json();
      if (result.ok && result.data.saves.length > 0) {
        // Return the most recent save
        return result.data.saves[0].saveData;
      }
      return null;
    },
    enabled: isSignedIn && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Save game mutation
  const saveGameMutation = useMutation({
    mutationFn: async ({ slot = 0, gameData }: { slot?: number; gameData: GameState }) => {
      if (!isSignedIn || !userId) throw new Error('Not authenticated');

      const response = await fetch(`/api/v1/games/${gameId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot,
          saveData: gameData,
          metadata: {
            level: gameData.level,
            score: gameData.score,
            playtime: gameData.metadata.playtime,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save game');
      }

      return response.json();
    },
    onSuccess: () => {
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ['game-save', gameId] });
    },
  });

  // Achievement unlock mutation
  const unlockAchievementMutation = useMutation({
    mutationFn: async ({
      achievementId,
      progress,
      metadata,
    }: {
      achievementId: string;
      progress?: number;
      metadata?: any;
    }) => {
      if (!isSignedIn || !userId) return;

      const response = await fetch(`/api/v1/achievements/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievementId, progress, metadata }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.ok && result.data.newUnlock) {
          // Show achievement notification
          showAchievementNotification(result.data.achievement, result.data.rewards);
        }
      }
    },
  });

  // Leaderboard submission mutation
  const submitScoreMutation = useMutation({
    mutationFn: async ({
      category,
      score,
      metadata,
    }: {
      category: string;
      score: number;
      metadata?: any;
    }) => {
      if (!isSignedIn || !userId) return;

      const response = await fetch(`/api/v1/leaderboards/${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          category,
          metadata: {
            playtime: gameState?.metadata.playtime || 0,
            ...metadata,
            checksum: generateChecksum({ score, category, metadata }),
          },
          replay: session ? JSON.stringify(session.actions.slice(-100)) : undefined, // Last 100 actions
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.ok && result.data.personalBest) {
          showLeaderboardNotification(result.data);
        }
      }
    },
  });

  // Petal transaction mutation
  const petalTransactionMutation = useMutation({
    mutationFn: async ({
      amount,
      reason,
      type,
    }: {
      amount: number;
      reason: string;
      type: 'award' | 'spend';
    }) => {
      if (!isSignedIn || !userId) return;

      const endpoint = type === 'award' ? '/api/v1/petals/collect' : '/api/v1/petals/spend';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason, gameId }),
      });

      return response.json();
    },
  });

  // Initialize game state when loaded
  useEffect(() => {
    if (loadedGame) {
      setGameState(loadedGame);
    } else if (!isLoading && isSignedIn) {
      // Initialize new game state
      const newGameState: GameState = {
        level: 1,
        score: 0,
        lives: 3,
        powerups: [],
        inventory: {},
        settings: {},
        progress: {},
        metadata: {
          playtime: 0,
          startedAt: new Date().toISOString(),
          lastSaved: new Date().toISOString(),
          version: 1,
        },
      };
      setGameState(newGameState);
    }
  }, [loadedGame, isLoading, isSignedIn]);

  // Auto-save setup
  useEffect(() => {
    if (autoSave && gameState && isSignedIn) {
      autoSaveIntervalRef.current = setInterval(() => {
        saveGameMutation.mutate({ gameData: gameState });
      }, autoSaveInterval);

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [autoSave, gameState, isSignedIn, autoSaveInterval]);

  // Session tracking
  useEffect(() => {
    sessionStartRef.current = Date.now();
    return () => {
      // Update playtime on unmount
      if (gameState) {
        const playtime = Date.now() - sessionStartRef.current;
        setGameState((prev) =>
          prev
            ? {
                ...prev,
                metadata: {
                  ...prev.metadata,
                  playtime: prev.metadata.playtime + playtime,
                },
              }
            : null,
        );
      }
    };
  }, []);

  // Utility functions
  const generateChecksum = useCallback((data: any): string => {
    return btoa(JSON.stringify(data)).slice(0, 16);
  }, []);

  const validateSession = useCallback((): boolean => {
    if (!session) return true;

    // Check for suspicious patterns
    const actionCount = session.actions.length;
    const timeSpan = Date.now() - session.startTime;
    const actionsPerSecond = actionCount / (timeSpan / 1000);

    // Flag if too many actions per second (possible bot)
    if (actionsPerSecond > 20) return false;

    // Check for score consistency
    const expectedScore = session.actions
      .filter((a) => a.type === 'score_update')
      .reduce((sum, a) => sum + (a.data.delta || 0), 0);

    if (Math.abs(expectedScore - session.currentScore) > 100) return false;

    return true;
  }, [session]);

  // API functions
  const saveGame = useCallback(
    async (slot = 0) => {
      if (!gameState) return;
      await saveGameMutation.mutateAsync({ slot, gameData: gameState });
    },
    [gameState, saveGameMutation],
  );

  const loadGame = useCallback(
    async (slot = 0): Promise<GameState | null> => {
      if (!isSignedIn || !userId) return null;

      const response = await fetch(`/api/v1/games/${gameId}/save?slot=${slot}`);
      if (!response.ok) return null;

      const result = await response.json();
      if (result.ok && result.data.saves.length > 0) {
        const loadedState = result.data.saves.find((s: any) => s.slot === slot)?.saveData;
        if (loadedState) {
          setGameState(loadedState);
          return loadedState;
        }
      }
      return null;
    },
    [gameId, isSignedIn, userId],
  );

  const resetGame = useCallback(() => {
    const newGameState: GameState = {
      level: 1,
      score: 0,
      lives: 3,
      powerups: [],
      inventory: {},
      settings: {},
      progress: {},
      metadata: {
        playtime: 0,
        startedAt: new Date().toISOString(),
        lastSaved: new Date().toISOString(),
        version: 1,
      },
    };
    setGameState(newGameState);
  }, []);

  const updateScore = useCallback(
    (score: number, metadata?: any) => {
      setGameState((prev) =>
        prev
          ? {
              ...prev,
              score,
              metadata: {
                ...prev.metadata,
                lastSaved: new Date().toISOString(),
              },
            }
          : null,
      );

      // Record action for anti-cheat
      recordAction('score_update', { score, delta: score - (gameState?.score || 0), metadata });
    },
    [gameState?.score],
  );

  const updateProgress = useCallback((progress: Partial<GameState>) => {
    setGameState((prev) =>
      prev
        ? {
            ...prev,
            ...progress,
            metadata: {
              ...prev.metadata,
              lastSaved: new Date().toISOString(),
            },
          }
        : null,
    );
  }, []);

  const unlockAchievement = useCallback(
    async (achievementId: string, progress = 1, metadata?: any) => {
      if (!enableAchievements) return;
      await unlockAchievementMutation.mutateAsync({ achievementId, progress, metadata });
    },
    [enableAchievements, unlockAchievementMutation],
  );

  const checkAchievements = useCallback(
    async (currentGameState: GameState) => {
      if (!enableAchievements || !isSignedIn) return;

      // Check for common achievements
      if (currentGameState.score > 0) {
        await unlockAchievement('first-game');
      }

      // Game-specific achievement checks would go here
      // This would be customized per game
    },
    [enableAchievements, isSignedIn, unlockAchievement],
  );

  const submitScore = useCallback(
    async (category: 'score' | 'time' | 'level', score: number, metadata?: any) => {
      if (!enableLeaderboards) return;
      await submitScoreMutation.mutateAsync({ category, score, metadata });
    },
    [enableLeaderboards, submitScoreMutation],
  );

  const awardPetals = useCallback(
    async (amount: number, reason: string) => {
      if (!enablePetals) return;
      await petalTransactionMutation.mutateAsync({ amount, reason, type: 'award' });
    },
    [enablePetals, petalTransactionMutation],
  );

  const spendPetals = useCallback(
    async (amount: number, reason: string) => {
      if (!enablePetals) return;
      await petalTransactionMutation.mutateAsync({ amount, reason, type: 'spend' });
    },
    [enablePetals, petalTransactionMutation],
  );

  const startSession = useCallback((): string => {
    const sessionId = `${gameId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const newSession: GameSession = {
      sessionId,
      gameId,
      startTime: Date.now(),
      currentScore: gameState?.score || 0,
      actions: [],
      checksum: generateChecksum({ sessionId, gameId, startTime: Date.now() }),
    };
    setSession(newSession);
    return sessionId;
  }, [gameId, gameState?.score, generateChecksum]);

  const endSession = useCallback(async () => {
    if (!session || !gameState) return;

    // Validate session before ending
    if (!validateSession()) {
      console.warn('Session validation failed');
      // Could report suspicious activity here
    }

    // Final save
    await saveGame();
    setSession(null);
  }, [session, gameState, validateSession, saveGame]);

  const recordAction = useCallback(
    (type: string, data: any) => {
      if (!session) return;

      const action = {
        type,
        timestamp: Date.now(),
        data,
      };

      setSession((prev) => {
        if (!prev) return null;

        const newActions = [...prev.actions, action];

        // Limit actions to prevent memory issues
        if (newActions.length > maxActions) {
          newActions.shift();
        }

        return {
          ...prev,
          actions: newActions,
          currentScore: type === 'score_update' ? data.score : prev.currentScore,
        };
      });
    },
    [session, maxActions],
  );

  const trackMetric = useCallback(
    (name: string, value: number, tags?: Record<string, string>) => {
      // Send to monitoring system
      fetch('/api/v1/metrics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: name,
          value,
          tags: { gameId, userId: userId || 'anonymous', ...tags },
        }),
      }).catch(console.error);
    },
    [gameId, userId],
  );

  return {
    gameState,
    isLoading,
    lastSaved,
    saveGame,
    loadGame,
    resetGame,
    updateScore,
    updateProgress,
    unlockAchievement,
    checkAchievements,
    submitScore,
    awardPetals,
    spendPetals,
    startSession,
    endSession,
    recordAction,
    trackMetric,
    generateChecksum,
    validateSession,
  };
}

// Utility functions for notifications
function showAchievementNotification(achievement: any, rewards: any) {
  // This would integrate with your notification system
  // Achievement unlocked: ${achievement.definition.name} with rewards: ${JSON.stringify(rewards)}
}

function showLeaderboardNotification(data: any) {
  // This would integrate with your notification system
  // New personal best! Rank: ${data.ranking}
}
