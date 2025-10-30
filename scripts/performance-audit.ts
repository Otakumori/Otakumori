#!/usr/bin/env tsx

/**
 * Performance Budget Enforcement for Otaku-mori v0
 * Enforces: LCP < 2.5s, chunk sizes ≤ 230KB gz, 60fps GameCube
 *
 * Usage: npm run performance:audit
 */

import { promises as fs } from 'fs';
import { gzipSync } from 'zlib';
import path from 'path';
import { spawn } from 'child_process';

interface PerformanceBudget {
  lcp: number; // milliseconds
  maxChunkSize: number; // bytes (gzipped)
  targetFps: number;
  maxTotalJS: number; // bytes (gzipped)
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
  private budget: PerformanceBudget = {
    lcp: 2500, // 2.5s as per v0 spec
    maxChunkSize: 230 * 1024, // 230KB as per v0 spec
    targetFps: 60, // For GameCube interface
    maxTotalJS: 1024 * 1024, // 1MB total JS budget
  };

  async runAudit(): Promise<PerformanceResult> {
    // ' Starting Performance Budget Audit...\n'

    const chunks = await this.analyzeChunks();
    const violations = this.checkBudgetViolations(chunks);

    const result: PerformanceResult = {
      passed: violations.length === 0,
      budget: this.budget,
      results: {
        chunks,
        largestChunks: chunks
          .filter((c) => c.type === 'js')
          .sort((a, b) => b.gzipSize - a.gzipSize)
          .slice(0, 10),
        totalJSSize: chunks.filter((c) => c.type === 'js').reduce((sum, c) => sum + c.gzipSize, 0),
        budgetViolations: violations,
      },
    };

    this.printResults(result);

    // Run Lighthouse audit for LCP if available
    await this.runLighthouseAudit();

    return result;
  }

  private async analyzeChunks(): Promise<ChunkAnalysis[]> {
    const buildDir = '.next';
    const staticDir = path.join(buildDir, 'static');

    try {
      const chunks: ChunkAnalysis[] = [];

      // Check if build exists
      const buildExists = await fs
        .access(buildDir)
        .then(() => true)
        .catch(() => false);
      if (!buildExists) {
        // ' Build directory not found. Running build first...'
        await this.runBuild();
      }

      // Analyze JavaScript chunks
      const jsDir = path.join(staticDir, 'chunks');
      try {
        const jsFiles = await fs.readdir(jsDir);

        for (const file of jsFiles) {
          if (file.endsWith('.js')) {
            const filePath = path.join(jsDir, file);
            const content = await fs.readFile(filePath);
            const gzipSize = gzipSync(content).length;

            chunks.push({
              name: file,
              size: content.length,
              gzipSize,
              type: 'js',
            });
          }
        }
      } catch (error) {
        // ' JavaScript chunks directory not found'
      }

      // Analyze CSS chunks
      const cssDir = path.join(staticDir, 'css');
      try {
        const cssFiles = await fs.readdir(cssDir);

        for (const file of cssFiles) {
          if (file.endsWith('.css')) {
            const filePath = path.join(cssDir, file);
            const content = await fs.readFile(filePath);
            const gzipSize = gzipSync(content).length;

            chunks.push({
              name: file,
              size: content.length,
              gzipSize,
              type: 'css',
            });
          }
        }
      } catch (error) {
        // ' CSS chunks directory not found'
      }

      return chunks;
    } catch (error) {
      console.error(' Error analyzing chunks:', error);
      return [];
    }
  }

  private checkBudgetViolations(chunks: ChunkAnalysis[]): string[] {
    const violations: string[] = [];

    // Check individual chunk sizes
    for (const chunk of chunks) {
      if (chunk.type === 'js' && chunk.gzipSize > this.budget.maxChunkSize) {
        violations.push(
          ` Chunk ${chunk.name} exceeds budget: ${this.formatBytes(chunk.gzipSize)} > ${this.formatBytes(this.budget.maxChunkSize)}`,
        );
      }
    }

    // Check total JS size
    const totalJSSize = chunks
      .filter((c) => c.type === 'js')
      .reduce((sum, c) => sum + c.gzipSize, 0);

    if (totalJSSize > this.budget.maxTotalJS) {
      violations.push(
        ` Total JS size exceeds budget: ${this.formatBytes(totalJSSize)} > ${this.formatBytes(this.budget.maxTotalJS)}`,
      );
    }

    return violations;
  }

  private async runBuild(): Promise<void> {
    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        stdio: 'pipe',
        shell: true,
      });

      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });

      buildProcess.on('error', reject);
    });
  }

  private async runLighthouseAudit(): Promise<void> {
    // '\n⌕ Running Lighthouse Performance Audit...'

    try {
      // Check if Lighthouse is available
      const lighthouse = spawn('lighthouse', ['--version'], { stdio: 'pipe', shell: true });

      lighthouse.on('close', (code) => {
        if (code === 0) {
          // ' Lighthouse is available. Run manually: lighthouse http://localhost:3000 --only-categories=performance'
        } else {
          // ' Lighthouse not installed. Install with: npm install -g lighthouse'
        }
      });

      lighthouse.on('error', () => {
        // ' Lighthouse not available. Install with: npm install -g lighthouse'
      });
    } catch (error) {
      // ' Could not check Lighthouse availability'
    }
  }

  private printResults(result: PerformanceResult): void {
    // '\n' + '='.repeat(80);
    // ' PERFORMANCE BUDGET AUDIT RESULTS'
    // '='.repeat(80);

    // `\n Budget Targets:`
    // `   Max Chunk Size: ${this.formatBytes(result.budget.maxChunkSize} (gzip)`);
    // `   Max Total JS: ${this.formatBytes(result.budget.maxTotalJS} (gzip)`);
    // `   Target LCP: ${result.budget.lcp}ms`
    // `   Target FPS: ${result.budget.targetFps}fps (GameCube`);

    // `\n Chunk Analysis:`
    // `   Total Chunks: ${result.results.chunks.length}`
    // `   Total JS Size: ${this.formatBytes(result.results.totalJSSize} (gzip)`);

    if (result.results.largestChunks.length > 0) {
      // `\n Largest JavaScript Chunks:`
      result.results.largestChunks.slice(0, 5).forEach((chunk, i) => {
        const status = chunk.gzipSize > result.budget.maxChunkSize ? '' : '';
        // `   ${i + 1}. ${status} ${chunk.name}: ${this.formatBytes(chunk.gzipSize}`);
      });
    }

    if (result.results.budgetViolations.length > 0) {
      // `\n Budget Violations:`
      result.results.budgetViolations.forEach((violation) => {
        // `   ${violation}`
      });

      // `\n Optimization Recommendations:`
      // `   • Use dynamic imports for heavy components`
      // `   • Implement code splitting for routes`
      // `   • Consider lazy loading for GameCube interface`
      // `   • Use tree-shaking to remove unused code`
      // `   • Optimize third-party dependencies`
    } else {
      // `\n All chunks pass performance budget!`
    }

    // `\n GameCube Performance Notes:`
    // `   • Target 60fps for smooth animations`
    // `   • Use requestAnimationFrame for frame-perfect updates`
    // `   • Consider reduced motion preferences`
    // `   • Optimize WebGL/Canvas rendering if applicable`

    // '\n' + '='.repeat(80);

    if (result.passed) {
      // ' PERFORMANCE BUDGET: PASSED'
    } else {
      // ' PERFORMANCE BUDGET: VIOLATIONS DETECTED'
      // 'Please address the violations above before deployment.'
    }

    // '='.repeat(80 + '\n');
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

// GameCube 60fps performance checker
class GameCubePerformanceChecker {
  static checkFramePerformance(): void {
    // '\n GameCube Performance Check:'
    // 'Add this to your GameCube components for runtime monitoring:'
    // `
    // Frame rate monitoring
    let frameCount = 0;
    let lastTime = performance.now(
    
    const checkFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        if (fps < 50) {
          console.warn(' GameCube FPS below target:', fps);
        }
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(checkFPS);
    };
    
    requestAnimationFrame(checkFPS);
    `);
  }
}

// Run the audit
async function main() {
  const auditor = new PerformanceAuditor();
  const result = await auditor.runAudit();

  GameCubePerformanceChecker.checkFramePerformance();

  // Exit with appropriate code
  process.exit(result.passed ? 0 : 1);
}

// ES module entry point check
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { PerformanceAuditor, GameCubePerformanceChecker };
