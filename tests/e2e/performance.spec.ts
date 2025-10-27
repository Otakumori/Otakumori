import { test, expect } from '@playwright/test';

/**
 * Performance smoke test
 * Spawns 80 NPCs and measures mean frame time over 1000 frames
 * Budget: < 16.6ms per frame (60 FPS)
 */

test('@perf NPC engine mean frame < 16.6ms for 1k frames', async ({ page }) => {
  // Check for GPU availability
  const envOverride = process.env.CI_HAS_GPU;
  const hasGPU =
    envOverride === 'true' ||
    (await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    }));

  test.skip(!hasGPU, 'No GPU/WebGL: skipping perf budget check');

  // Navigate to headless perf page
  await page.goto('/perf-headless');

  // Wait for MockEngine to be ready
  await page.waitForFunction(() => (window as any).__PERF_READY__ === true, {
    timeout: 10000,
  });

  console.log('MockEngine ready, starting benchmark...');

  // Run benchmark
  const result = await page.evaluate(async () => {
    // Access the MockEngine exposed by the page
    const engine = (window as any).MockEngine;

    if (!engine) {
      throw new Error('MockEngine not found on window');
    }

    // Spawn 80 NPCs
    engine.spawn(80);

    const targetFrames = 1000;
    const warmupFrames = 60;
    let frameCount = 0;
    let totalTime = 0;
    let lastTime = performance.now();

    // Run the update loop
    await new Promise<void>((resolve) => {
      function tick() {
        const now = performance.now();
        const dt = now - lastTime;
        lastTime = now;

        // Run engine update (dt in milliseconds)
        engine.update(dt);

        // Collect time after warmup
        if (frameCount >= warmupFrames) {
          totalTime += dt;
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

    const effectiveFrames = targetFrames - warmupFrames;
    const meanFrame = totalTime / effectiveFrames;

    return {
      meanFrame,
      totalFrames: targetFrames,
      effectiveFrames,
      totalTime,
      npcCount: engine.entities.length,
    };
  });

  // Log detailed results
  console.log('Performance Benchmark Results:');
  console.log(`  NPCs spawned: ${result.npcCount}`);
  console.log(`  Total frames: ${result.totalFrames}`);
  console.log(`  Effective frames (after warmup): ${result.effectiveFrames}`);
  console.log(`  Total time: ${result.totalTime.toFixed(2)}ms`);
  console.log(`  Mean frame time: ${result.meanFrame.toFixed(2)}ms`);
  console.log(`  Target: < 16.6ms (60 FPS)`);
  console.log(`  Status: ${result.meanFrame < 16.6 ? 'PASS ✓' : 'FAIL ✗'}`);

  // Assert performance budget
  expect(
    result.meanFrame,
    `Mean frame time ${result.meanFrame.toFixed(2)}ms exceeds 16.6ms budget`,
  ).toBeLessThan(16.6);
});

// Optional: Test with lower NPC count for CI environments
test('@perf NPC engine mean frame < 16.6ms with 50 NPCs (CI)', async ({ page }) => {
  const envOverride = process.env.CI_HAS_GPU;
  const isCI = process.env.CI === 'true';
  const hasGPU =
    envOverride === 'true' ||
    (await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    }));

  // Only run this test in CI environments
  test.skip(!isCI, 'Not in CI environment');
  test.skip(!hasGPU, 'No GPU/WebGL: skipping perf budget check');

  await page.goto('/perf-headless');
  await page.waitForFunction(() => (window as any).__PERF_READY__ === true, {
    timeout: 10000,
  });

  console.log('MockEngine ready (CI mode), starting benchmark with 50 NPCs...');

  const result = await page.evaluate(async () => {
    const engine = (window as any).MockEngine;
    if (!engine) throw new Error('MockEngine not found');

    // Spawn fewer NPCs for CI
    engine.spawn(50);

    const targetFrames = 500; // Shorter test for CI
    const warmupFrames = 30;
    let frameCount = 0;
    let totalTime = 0;
    let lastTime = performance.now();

    await new Promise<void>((resolve) => {
      function tick() {
        const now = performance.now();
        const dt = now - lastTime;
        lastTime = now;

        engine.update(dt);

        if (frameCount >= warmupFrames) {
          totalTime += dt;
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

    const effectiveFrames = targetFrames - warmupFrames;
    const meanFrame = totalTime / effectiveFrames;

    return {
      meanFrame,
      totalFrames: targetFrames,
      effectiveFrames,
      npcCount: engine.entities.length,
    };
  });

  console.log(
    `CI Performance: ${result.meanFrame.toFixed(2)}ms mean frame (${result.npcCount} NPCs)`,
  );

  expect(
    result.meanFrame,
    `CI mean frame time ${result.meanFrame.toFixed(2)}ms exceeds 16.6ms budget`,
  ).toBeLessThan(16.6);
});
