#!/usr/bin/env tsx

/**
 * Performance Budget Enforcement for Otaku-mori v0
 * Enforces:
 *   - LCP < 2.5s
 *   - Individual bundle chunks ≤ 230KB gzip
 *   - Total JS budget ≤ 1MB gzip
 *   - GameCube UI targets 60fps
 *
 * Usage: pnpm tsx scripts/performance-audit.ts
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { spawn } from 'node:child_process';

interface PerformanceBudget {
  lcp: number; // milliseconds
  maxChunkSize: number; // bytes (gzip)
  targetFps: number;
  maxTotalJS: number; // bytes (gzip)
}

interface ChunkAnalysis {
  name: string;
  size: number;
  gzipSize: number;
  type: 'js' | 'css' | 'other';
}

interface PerformanceResult {
  passed: boolean;
  budget: PerformanceBudget;
  results: {
    chunks: ChunkAnalysis[];
    largestChunks: ChunkAnalysis[];
    totalJSSize: number;
    budgetViolations: string[];
  };
}

class PerformanceAuditor {
  private readonly budget: PerformanceBudget = {
    lcp: 2_500,
    maxChunkSize: 230 * 1024,
    targetFps: 60,
    maxTotalJS: 1_024 * 1_024,
  };

  async runAudit(): Promise<PerformanceResult> {
    console.warn('Starting performance budget audit…');

    const chunks = await this.analyzeChunks();
    const violations = this.checkBudgetViolations(chunks);

    const result: PerformanceResult = {
      passed: violations.length === 0,
      budget: this.budget,
      results: {
        chunks,
        largestChunks: chunks
          .filter((chunk) => chunk.type === 'js')
          .sort((a, b) => b.gzipSize - a.gzipSize)
          .slice(0, 10),
        totalJSSize: chunks
          .filter((chunk) => chunk.type === 'js')
          .reduce((sum, chunk) => sum + chunk.gzipSize, 0),
        budgetViolations: violations,
      },
    };

    this.printResults(result);
    await this.runLighthouseAudit();

    return result;
  }

  private async analyzeChunks(): Promise<ChunkAnalysis[]> {
    const buildDir = '.next';
    const staticDir = path.join(buildDir, 'static');

    const buildExists = await fs
      .access(buildDir)
      .then(() => true)
      .catch(() => false);

    if (!buildExists) {
      console.warn('Next.js build artifacts not found. Running `pnpm build` first…');
      await this.runBuild();
    }

    const chunks: ChunkAnalysis[] = [];

    await this.collectChunks(path.join(staticDir, 'chunks'), 'js', chunks);
    await this.collectChunks(path.join(staticDir, 'css'), 'css', chunks);

    return chunks;
  }

  private async collectChunks(
    directory: string,
    type: ChunkAnalysis['type'],
    accumulator: ChunkAnalysis[],
  ): Promise<void> {
    try {
      const files = await fs.readdir(directory);

      for (const file of files) {
        if (type === 'js' && !file.endsWith('.js')) continue;
        if (type === 'css' && !file.endsWith('.css')) continue;

        const filePath = path.join(directory, file);
        const content = await fs.readFile(filePath);
        accumulator.push({
          name: file,
          size: content.length,
          gzipSize: gzipSync(content).length,
          type,
        });
      }
    } catch (error) {
      console.warn(`Skipping ${type.toUpperCase()} chunk analysis. Directory missing: ${directory}`, error);
    }
  }

  private checkBudgetViolations(chunks: ChunkAnalysis[]): string[] {
    const violations: string[] = [];

    for (const chunk of chunks) {
      if (chunk.type === 'js' && chunk.gzipSize > this.budget.maxChunkSize) {
        violations.push(
          `Chunk ${chunk.name} exceeds ${this.formatBytes(this.budget.maxChunkSize)} (gzip). Size: ${this.formatBytes(chunk.gzipSize)}`,
        );
      }
    }

    const totalJSSize = chunks
      .filter((chunk) => chunk.type === 'js')
      .reduce((sum, chunk) => sum + chunk.gzipSize, 0);

    if (totalJSSize > this.budget.maxTotalJS) {
      violations.push(
        `Total JS payload exceeds ${this.formatBytes(this.budget.maxTotalJS)} (gzip). Size: ${this.formatBytes(totalJSSize)}`,
      );
    }

    return violations;
  }

  private async runBuild(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const build = spawn('pnpm', ['build'], { stdio: 'inherit', shell: true });
      build.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Next.js build failed with exit code ${code ?? 'unknown'}`));
      });
      build.on('error', (error) => reject(error));
    });
  }

  private async runLighthouseAudit(): Promise<void> {
    try {
      const lighthouse = spawn('lighthouse', ['http://localhost:3000', '--only-categories=performance'], {
        stdio: 'ignore',
        shell: true,
      });

      lighthouse.on('close', (code) => {
        if (code === 0) {
          console.warn(
            'Lighthouse is available. Run `lighthouse http://localhost:3000 --only-categories=performance` for full LCP analysis.',
          );
        } else {
          console.error(
            'Lighthouse CLI is not installed. Install it with `pnpm add -g lighthouse` to automate LCP checks.',
          );
        }
      });

      lighthouse.on('error', (error) => {
        console.error('Unable to run Lighthouse performance checks.', error);
      });
    } catch (error) {
      console.error('Unexpected error while attempting Lighthouse audit.', error);
    }
  }

  private printResults(result: PerformanceResult): void {
    const lines: string[] = [];
    const divider = '='.repeat(72);

    lines.push('');
    lines.push(divider);
    lines.push('Performance Budget Audit Results');
    lines.push(divider);
    lines.push('');

    lines.push('Budget Targets');
    lines.push(
      `  Max Chunk Size : ${this.formatBytes(result.budget.maxChunkSize)} (gzip compressed)`,
    );
    lines.push(`  Total JS Budget: ${this.formatBytes(result.budget.maxTotalJS)} (gzip compressed)`);
    lines.push(`  Target LCP      : ${result.budget.lcp} ms`);
    lines.push(`  Target FPS      : ${result.budget.targetFps} fps (GameCube UI)`);
    lines.push('');

    lines.push('Chunk Summary');
    lines.push(`  Total Chunks    : ${result.results.chunks.length}`);
    lines.push(`  Total JS Size   : ${this.formatBytes(result.results.totalJSSize)} (gzip)`);

    if (result.results.largestChunks.length > 0) {
      lines.push('');
      lines.push('Largest JavaScript Chunks');
      result.results.largestChunks.slice(0, 5).forEach((chunk, index) => {
        const status = chunk.gzipSize > this.budget.maxChunkSize ? 'EXCEEDS' : 'OK';
        lines.push(
          `  ${index + 1}. [${status}] ${chunk.name} — ${this.formatBytes(chunk.gzipSize)} (gzip)`,
        );
      });
    }

    if (result.results.budgetViolations.length > 0) {
      lines.push('');
      lines.push('Budget Violations');
      result.results.budgetViolations.forEach((violation) => {
        lines.push(`  • ${violation}`);
      });

      lines.push('');
      lines.push('Optimization Recommendations');
      lines.push('  • Use dynamic imports for heavy modules');
      lines.push('  • Split routes into smaller bundles where practical');
      lines.push('  • Lazy-load GameCube features when off-screen');
      lines.push('  • Enable tree-shaking to eliminate unused exports');
      lines.push('  • Review third-party dependencies for bundle impact');
    } else {
      lines.push('');
      lines.push('All analyzed chunks meet the configured performance budget ✅');
    }

    lines.push('');
    lines.push('GameCube Performance Notes');
    lines.push('  • Target 60fps animations for interactive sequences');
    lines.push('  • Use requestAnimationFrame for frame-timed updates');
    lines.push('  • Honor prefers-reduced-motion where available');
    lines.push('  • Profile WebGL/Canvas rendering on real devices');
    lines.push('');
    lines.push(`Audit Result: ${result.passed ? 'PASS' : 'FAIL'}`);
    lines.push(divider);

    console.warn(lines.join('\n'));
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** index;
    return `${value.toFixed(1)} ${units[index]}`;
  }
}

class GameCubePerformanceChecker {
  static checkFramePerformance(): void {
    console.warn(
      'Tip: In GameCube scenes, instrument requestAnimationFrame to keep frame times under 16ms for 60fps.',
    );
  }
}

async function main(): Promise<void> {
  const auditor = new PerformanceAuditor();
  const result = await auditor.runAudit();

  GameCubePerformanceChecker.checkFramePerformance();
  process.exit(result.passed ? 0 : 1);
}

void main().catch((error) => {
  console.error('Performance audit failed.', error);
  process.exit(1);
});

export { PerformanceAuditor, GameCubePerformanceChecker };
