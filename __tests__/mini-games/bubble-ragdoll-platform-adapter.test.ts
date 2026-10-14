import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const gameSource = readFileSync(
  join(process.cwd(), 'app/mini-games/(games)/bubble-ragdoll/Game.tsx'),
  'utf8',
);
const sceneSource = readFileSync(
  join(process.cwd(), 'app/mini-games/(games)/bubble-ragdoll/Scene.tsx'),
  'utf8',
);

describe('Bubble Ragdoll shared-platform adapter', () => {
  it('uses shared lifecycle, results, exit, and progression authority', () => {
    expect(gameSource).toContain('useGameSession<BubbleRagdollResult>');
    expect(gameSource).toContain("beginResultSession('bubble-ragdoll')");
    expect(gameSource).toContain('recordResult({');
    expect(gameSource).toContain('onBack={session.exit}');
  });

  it('keeps pointer and physics authority inside the scene while accepting controlled pause', () => {
    expect(sceneSource).toContain("c.addEventListener('pointerdown', onPointerDown)");
    expect(sceneSource).toContain('if (pausedRef.current) return');
    expect(sceneSource).toContain('endAt += pausedFor');
    expect(sceneSource).toContain('cancelAnimationFrame(raf)');
    expect(sceneSource).toContain("c.removeEventListener('pointerdown', onPointerDown)");
  });

  it('removes duplicate legacy finish and global result authorities', () => {
    expect(sceneSource).not.toContain('/api/games/finish');
    expect(sceneSource).not.toContain('__gameEnd');
  });
});
