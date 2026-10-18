import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import MaidCafeGame from '@/app/mini-games/(games)/maid-cafe-manager/MaidCafeGame';

const { autoSave, saveOnExit } = vi.hoisted(() => ({
  autoSave: vi.fn().mockResolvedValue(undefined),
  saveOnExit: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/app/mini-games/_shared/SaveSystem', () => ({
  useGameSave: () => ({ autoSave, saveOnExit }),
}));

vi.mock('@/constants.client', () => ({
  RUNTIME_FLAGS: { isDev: false },
}));

describe('bounded game product completion', () => {
  it('lets the player end a Maid Cafe shift through the existing result contract', async () => {
    const onGameEnd = vi.fn();

    render(<MaidCafeGame onGameEnd={onGameEnd} />);
    fireEvent.click(screen.getByRole('button', { name: 'End Shift' }));

    await waitFor(() => {
      expect(onGameEnd).toHaveBeenCalledWith({ score: 0, money: 50, level: 1 });
    });
    expect(saveOnExit).toHaveBeenCalledOnce();
  });

  it('keeps Puzzle Reveal difficulty choices readable and semantic', () => {
    const source = readFileSync(
      join(process.cwd(), 'app/mini-games/(games)/puzzle-reveal/page.tsx'),
      'utf8',
    );

    expect(source).toContain("easy: 'Easy (4×3)'");
    expect(source).toContain("expert: 'Expert (10×8)'");
    expect(source).toContain('{DIFFICULTY_LABELS[difficulty]}');
    expect(source).not.toContain("'<span role=\"img\"");
  });

  it('uses repository-backed approved art for Puzzle Reveal', () => {
    const gameSource = readFileSync(
      join(process.cwd(), 'app/mini-games/(games)/puzzle-reveal/EnhancedTileGame.tsx'),
      'utf8',
    );
    const assets = [
      'public/assets/games/covers/game-puzzle-reveal-cover.webp',
      'public/assets/games/hub/game-puzzle-reveal-hub.webp',
    ];

    for (const asset of assets) expect(existsSync(join(process.cwd(), asset))).toBe(true);
    expect(gameSource).not.toContain('/assets/reveal/anime-landscape-1.jpg');
    expect(gameSource).not.toContain('/assets/reveal/anime-character-1.jpg');
  });
});
