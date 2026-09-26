import { test, expect, type Page } from '@playwright/test';

const FRAME_BUDGET_60_FPS_MS = 1000 / 60;

type NpcUpdateBenchmarkOptions = {
  npcCount: number;
  targetFrames: number;
  warmupFrames: number;
};

type NpcUpdateBenchmarkResult = {
  meanUpdateMs: number;
  p95UpdateMs: number;
  maxUpdateMs: number;
  totalUpdateMs: number;
  totalFrames: number;
  sampleCount: number;
  npcCount: number;
};

async function hasWebGl(page: Page): Promise<boolean> {
  const envOverride = process.env.CI_HAS_GPU;

  return (
    envOverride === 'true' ||
    page.evaluate(() => {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    })
  );
}

/**
 * Measures MockEngine.update() CPU work while requestAnimationFrame supplies
 * realistic deltas. rAF spacing is intentionally excluded: it is controlled
 * by browser/host scheduling, not by the NPC engine.
 */
async function measureNpcUpdateDuration(
  page: Page,
  options: NpcUpdateBenchmarkOptions,
): Promise<NpcUpdateBenchmarkResult> {
  return page.evaluate(async ({ npcCount, targetFrames, warmupFrames }) => {
    const engine = (window as any).MockEngine;

    if (!engine) {
      throw new Error('MockEngine not found on window');
    }

    engine.spawn(npcCount);

    const updateDurations: number[] = [];
    let frameCount = 0;
    let lastTime = performance.now();

    await new Promise<void>((resolve) => {
      function tick() {
        const now = performance.now();
        const dt = now - lastTime;
        lastTime = now;

        const updateStart = performance.now();
        engine.update(dt);
        const updateDuration = performance.now() - updateStart;

        if (frameCount >= warmupFrames) {
          updateDurations.push(updateDuration);
        }

        frameCount++;

        if (frameCount < targetFrames) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      }

      requestAnimationFrame(tick);
    });

    const totalUpdateMs = updateDurations.reduce((total, duration) => total + duration, 0);
    const sortedDurations = [...updateDurations].sort((left, right) => left - right);
    const p95Index = Math.ceil(sortedDurations.length * 0.95) - 1;

    return {
      meanUpdateMs: totalUpdateMs / updateDurations.length,
      p95UpdateMs: sortedDurations[p95Index],
      maxUpdateMs: sortedDurations[sortedDurations.length - 1],
      totalUpdateMs,
      totalFrames: targetFrames,
      sampleCount: updateDurations.length,
      npcCount: engine.entities.length,
    };
  }, options);
}

function expectNpcUpdateBudget(result: NpcUpdateBenchmarkResult, label: string): void {
  expect(
    result.meanUpdateMs,
    `${label} mean update duration ${result.meanUpdateMs.toFixed(3)}ms exceeds the 60 FPS CPU budget`,
  ).toBeLessThanOrEqual(FRAME_BUDGET_60_FPS_MS);
  expect(
    result.p95UpdateMs,
    `${label} p95 update duration ${result.p95UpdateMs.toFixed(3)}ms exceeds the 60 FPS CPU budget`,
  ).toBeLessThanOrEqual(FRAME_BUDGET_60_FPS_MS);
}

function logNpcUpdateBenchmark(result: NpcUpdateBenchmarkResult, label: string): void {
  console.log(`${label} Benchmark Results:`);
  console.log(`  NPCs spawned: ${result.npcCount}`);
  console.log(`  Total frames: ${result.totalFrames}`);
  console.log(`  Update samples (after warmup): ${result.sampleCount}`);
  console.log(`  Total update CPU time: ${result.totalUpdateMs.toFixed(3)}ms`);
  console.log(`  Mean update CPU time: ${result.meanUpdateMs.toFixed(3)}ms`);
  console.log(`  P95 update CPU time: ${result.p95UpdateMs.toFixed(3)}ms`);
  console.log(`  Max update CPU time (diagnostic): ${result.maxUpdateMs.toFixed(3)}ms`);
  console.log(`  Budget: <= ${FRAME_BUDGET_60_FPS_MS.toFixed(3)}ms per update (60 FPS)`);
}

test('@perf NPC engine update CPU time stays within the 60 FPS budget for 1k frames', async ({ page }) => {
  const hasGPU = await hasWebGl(page);

  test.skip(!hasGPU, 'No GPU/WebGL: skipping perf budget check');

  await page.goto('/perf-headless');
  await page.waitForFunction(() => (window as any).__PERF_READY__ === true, {
    timeout: 10000,
  });

  const result = await measureNpcUpdateDuration(page, {
    npcCount: 80,
    targetFrames: 1000,
    warmupFrames: 60,
  });

  logNpcUpdateBenchmark(result, '1k-frame NPC update');
  expectNpcUpdateBudget(result, '1k-frame NPC update');
});

test('@perf NPC engine update CPU time stays within the 60 FPS budget with 50 NPCs (CI)', async ({ page }) => {
  const isCI = process.env.CI === 'true';
  const hasGPU = await hasWebGl(page);

  test.skip(!isCI, 'Not in CI environment');
  test.skip(!hasGPU, 'No GPU/WebGL: skipping perf budget check');

  await page.goto('/perf-headless');
  await page.waitForFunction(() => (window as any).__PERF_READY__ === true, {
    timeout: 10000,
  });

  const result = await measureNpcUpdateDuration(page, {
    npcCount: 50,
    targetFrames: 500,
    warmupFrames: 30,
  });

  logNpcUpdateBenchmark(result, 'CI 50-NPC update');
  expectNpcUpdateBudget(result, 'CI 50-NPC update');
});
