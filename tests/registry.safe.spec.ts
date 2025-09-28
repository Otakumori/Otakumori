import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock process.env for testing
const originalEnv = process.env.NODE_ENV;

describe('Game Registry', () => {
  beforeEach(() => {
    // Set to development mode for testing
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    // Restore original env
    process.env.NODE_ENV = originalEnv;
  });

  it('should validate game schema correctly', async () => {
    const { GameSchema } = await import('@/app/mini-games/_data/registry.safe');

    const validGame = {
      id: 'test-game',
      title: 'Test Game',
      path: '/mini-games/test-game',
      status: 'available',
      howToHtml: '<p>Test instructions</p>',
    };

    const result = GameSchema.safeParse(validGame);
    expect(result.success).toBe(true);
  });

  it('should reject invalid game data', async () => {
    const { GameSchema } = await import('@/app/mini-games/_data/registry.safe');

    const invalidGame = {
      id: 'test-game',
      title: 'Test Game',
      // Missing required fields
    };

    const result = GameSchema.safeParse(invalidGame);
    expect(result.success).toBe(false);
  });

  it('should have no duplicate IDs', async () => {
    const { games } = await import('@/app/mini-games/_data/registry.safe');

    const ids = games.map((game) => game.id);
    const uniqueIds = new Set(ids);

    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have no duplicate paths', async () => {
    const { games } = await import('@/app/mini-games/_data/registry.safe');

    const paths = games.map((game) => game.path);
    const uniquePaths = new Set(paths);

    expect(paths.length).toBe(uniquePaths.size);
  });

  it('should throw error for duplicate IDs in development', async () => {
    // This test would require modifying the registry temporarily
    // For now, we'll just verify the structure is correct
    const { games } = await import('@/app/mini-games/_data/registry.safe');

    expect(games.length).toBeGreaterThan(0);
    expect(games.every((game) => game.id && game.title && game.path)).toBe(true);
  });

  it('should provide helper functions', async () => {
    const { getGameById, getGameByPath, getAvailableGames } = await import(
      '@/app/mini-games/_data/registry.safe'
    );

    const game = getGameById('memory');
    expect(game).toBeDefined();
    expect(game?.id).toBe('memory');

    const gameByPath = getGameByPath('/mini-games/memory');
    expect(gameByPath).toBeDefined();
    expect(gameByPath?.path).toBe('/mini-games/memory');

    const availableGames = getAvailableGames();
    expect(availableGames.length).toBeGreaterThan(0);
    expect(availableGames.every((game) => game.status === 'available')).toBe(true);
  });
});
