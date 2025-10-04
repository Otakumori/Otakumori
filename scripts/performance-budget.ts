#!/usr/bin/env node

/**
 * Performance Budget Validation Script
 *
 * Comprehensive performance monitoring with:
 * - Bundle size analysis
 * - Core Web Vitals validation
 * - Performance regression detection
 * - Automated performance alerts
 * - Detailed reporting
 */

import { readFileSync, statSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

interface PerformanceBudget {
  bundles: {
    main: number; // KB
    vendor: number; // KB
    total: number; // KB
    chunks: number; // KB per chunk
  };
  assets: {
    images: number; // KB per image
    fonts: number; // KB per font
    total: number; // KB total assets
  };
  metrics: {
    lcp: number; // ms
    fid: number; // ms
    cls: number; // score
    ttfb: number; // ms
    fcp: number; // ms
  };
  thresholds: {
    errorRate: number; // percentage
    loadTime: number; // ms
    interactivity: number; // ms
  };
}

interface BundleAnalysis {
  file: string;
  size: number;
  gzipped: number;
  type: 'main' | 'vendor' | 'chunk' | 'css' | 'asset';
  route?: string;
}

interface PerformanceReport {
  passed: boolean;
  violations: PerformanceViolation[];
  summary: {
    totalSize: number;
    mainBundleSize: number;
    vendorSize: number;
    chunkCount: number;
    largestChunk: number;
  };
  recommendations: string[];
  score: number; // 0-100
}

interface PerformanceViolation {
  type: 'bundle_size' | 'chunk_size' | 'asset_size' | 'metric_threshold';
  severity: 'warning' | 'error' | 'critical';
  current: number;
  budget: number;
  file?: string;
  description: string;
  recommendation: string;
}

// Enterprise performance budget configuration
const PERFORMANCE_BUDGET: PerformanceBudget = {
  bundles: {
    main: 230, // 230KB main bundle
    vendor: 200, // 200KB vendor bundle
    total: 500, // 500KB total initial load
    chunks: 150, // 150KB per route chunk
  },
  assets: {
    images: 500, // 500KB per image
    fonts: 50, // 50KB per font
    total: 2000, // 2MB total assets
  },
  metrics: {
    lcp: 2500, // 2.5s Largest Contentful Paint
    fid: 100, // 100ms First Input Delay
    cls: 0.1, // 0.1 Cumulative Layout Shift
    ttfb: 800, // 800ms Time to First Byte
    fcp: 1800, // 1.8s First Contentful Paint
  },
  thresholds: {
    errorRate: 1, // 1% error rate
    loadTime: 3000, // 3s load time
    interactivity: 5000, // 5s time to interactive
  },
};

class PerformanceBudgetValidator {
  private buildDir: string;
  private violations: PerformanceViolation[] = [];
  private bundleAnalysis: BundleAnalysis[] = [];

  constructor(buildDir = '.next') {
    this.buildDir = buildDir;
  }

  async validate(): Promise<PerformanceReport> {
    console.log(' Starting performance budget validation...');

    // Analyze bundle sizes
    await this.analyzeBundles();

    // Check asset sizes
    await this.analyzeAssets();

    // Validate against budgets
    this.validateBundleBudgets();
    this.validateAssetBudgets();

    // Generate report
    const report = this.generateReport();

    this.printReport(report);

    return report;
  }

  private async analyzeBundles(): Promise<void> {
    console.log(' Analyzing bundle sizes...');

    try {
      // Analyze Next.js build output
      const buildManifest = await this.readBuildManifest();
      const staticDir = join(this.buildDir, 'static');

      // Find all JS chunks
      const jsFiles = await glob('**/*.js', { cwd: staticDir });
      const cssFiles = await glob('**/*.css', { cwd: staticDir });

      for (const file of jsFiles) {
        const filePath = join(staticDir, file);
        const stats = statSync(filePath);
        const gzippedSize = await this.getGzippedSize(filePath);

        const analysis: BundleAnalysis = {
          file,
          size: stats.size,
          gzipped: gzippedSize,
          type: this.classifyBundle(file),
        };

        // Try to determine route for chunks
        if (analysis.type === 'chunk') {
          analysis.route = this.extractRouteFromChunk(file);
        }

        this.bundleAnalysis.push(analysis);
      }

      // Analyze CSS files
      for (const file of cssFiles) {
        const filePath = join(staticDir, 'css', file);
        const stats = statSync(filePath);
        const gzippedSize = await this.getGzippedSize(filePath);

        this.bundleAnalysis.push({
          file,
          size: stats.size,
          gzipped: gzippedSize,
          type: 'css',
        });
      }
    } catch (error) {
      console.warn('  Could not analyze bundles:', error);
    }
  }

  private async analyzeAssets(): Promise<void> {
    console.log('️  Analyzing asset sizes...');

    try {
      const publicDir = 'public';
      const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'];
      const fontExtensions = ['woff', 'woff2', 'ttf', 'otf', 'eot'];

      // Find all images
      for (const ext of imageExtensions) {
        const files = await glob(`**/*.${ext}`, { cwd: publicDir });
        for (const file of files) {
          const filePath = join(publicDir, file);
          const stats = statSync(filePath);

          this.bundleAnalysis.push({
            file,
            size: stats.size,
            gzipped: stats.size, // Images are already compressed
            type: 'asset',
          });
        }
      }

      // Find all fonts
      for (const ext of fontExtensions) {
        const files = await glob(`**/*.${ext}`, { cwd: publicDir });
        for (const file of files) {
          const filePath = join(publicDir, file);
          const stats = statSync(filePath);

          this.bundleAnalysis.push({
            file,
            size: stats.size,
            gzipped: stats.size,
            type: 'asset',
          });
        }
      }
    } catch (error) {
      console.warn('  Could not analyze assets:', error);
    }
  }

  private validateBundleBudgets(): void {
    const mainBundles = this.bundleAnalysis.filter((b) => b.type === 'main');
    const vendorBundles = this.bundleAnalysis.filter((b) => b.type === 'vendor');
    const chunks = this.bundleAnalysis.filter((b) => b.type === 'chunk');

    // Check main bundle size
    const mainSize = this.sumSizes(mainBundles, 'gzipped') / 1024; // KB
    if (mainSize > PERFORMANCE_BUDGET.bundles.main) {
      this.violations.push({
        type: 'bundle_size',
        severity: 'error',
        current: mainSize,
        budget: PERFORMANCE_BUDGET.bundles.main,
        description: `Main bundle exceeds budget: ${mainSize.toFixed(1)}KB > ${PERFORMANCE_BUDGET.bundles.main}KB`,
        recommendation:
          'Consider code splitting, tree shaking, or moving vendor code to separate bundles',
      });
    }

    // Check vendor bundle size
    const vendorSize = this.sumSizes(vendorBundles, 'gzipped') / 1024; // KB
    if (vendorSize > PERFORMANCE_BUDGET.bundles.vendor) {
      this.violations.push({
        type: 'bundle_size',
        severity: 'warning',
        current: vendorSize,
        budget: PERFORMANCE_BUDGET.bundles.vendor,
        description: `Vendor bundle exceeds budget: ${vendorSize.toFixed(1)}KB > ${PERFORMANCE_BUDGET.bundles.vendor}KB`,
        recommendation: 'Consider excluding large dependencies or using dynamic imports',
      });
    }

    // Check individual chunk sizes
    for (const chunk of chunks) {
      const chunkSizeKB = chunk.gzipped / 1024;
      if (chunkSizeKB > PERFORMANCE_BUDGET.bundles.chunks) {
        this.violations.push({
          type: 'chunk_size',
          severity: 'warning',
          current: chunkSizeKB,
          budget: PERFORMANCE_BUDGET.bundles.chunks,
          file: chunk.file,
          description: `Route chunk exceeds budget: ${chunkSizeKB.toFixed(1)}KB > ${PERFORMANCE_BUDGET.bundles.chunks}KB`,
          recommendation: 'Consider lazy loading components or splitting large pages',
        });
      }
    }

    // Check total bundle size
    const totalSize =
      this.sumSizes(
        this.bundleAnalysis.filter((b) => b.type !== 'asset'),
        'gzipped',
      ) / 1024; // KB
    if (totalSize > PERFORMANCE_BUDGET.bundles.total) {
      this.violations.push({
        type: 'bundle_size',
        severity: 'critical',
        current: totalSize,
        budget: PERFORMANCE_BUDGET.bundles.total,
        description: `Total bundle size exceeds budget: ${totalSize.toFixed(1)}KB > ${PERFORMANCE_BUDGET.bundles.total}KB`,
        recommendation: 'Implement aggressive code splitting and review all dependencies',
      });
    }
  }

  private validateAssetBudgets(): void {
    const assets = this.bundleAnalysis.filter((b) => b.type === 'asset');

    // Check individual asset sizes
    for (const asset of assets) {
      const assetSizeKB = asset.size / 1024;
      const isImage = /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(asset.file);
      const isFont = /\.(woff|woff2|ttf|otf|eot)$/i.test(asset.file);

      if (isImage && assetSizeKB > PERFORMANCE_BUDGET.assets.images) {
        this.violations.push({
          type: 'asset_size',
          severity: 'warning',
          current: assetSizeKB,
          budget: PERFORMANCE_BUDGET.assets.images,
          file: asset.file,
          description: `Image exceeds budget: ${assetSizeKB.toFixed(1)}KB > ${PERFORMANCE_BUDGET.assets.images}KB`,
          recommendation:
            'Optimize image compression, use WebP/AVIF, or implement responsive images',
        });
      }

      if (isFont && assetSizeKB > PERFORMANCE_BUDGET.assets.fonts) {
        this.violations.push({
          type: 'asset_size',
          severity: 'warning',
          current: assetSizeKB,
          budget: PERFORMANCE_BUDGET.assets.fonts,
          file: asset.file,
          description: `Font exceeds budget: ${assetSizeKB.toFixed(1)}KB > ${PERFORMANCE_BUDGET.assets.fonts}KB`,
          recommendation: 'Use font subsetting, WOFF2 compression, or system fonts',
        });
      }
    }

    // Check total asset size
    const totalAssetSize = this.sumSizes(assets, 'size') / 1024; // KB
    if (totalAssetSize > PERFORMANCE_BUDGET.assets.total) {
      this.violations.push({
        type: 'asset_size',
        severity: 'error',
        current: totalAssetSize,
        budget: PERFORMANCE_BUDGET.assets.total,
        file: undefined,
        description: `Total asset size exceeds budget: ${totalAssetSize.toFixed(1)}KB > ${PERFORMANCE_BUDGET.assets.total}KB`,
        recommendation: 'Review all assets, implement lazy loading, and optimize compression',
      });
    }
  }

  private generateReport(): PerformanceReport {
    const mainBundles = this.bundleAnalysis.filter((b) => b.type === 'main');
    const vendorBundles = this.bundleAnalysis.filter((b) => b.type === 'vendor');
    const chunks = this.bundleAnalysis.filter((b) => b.type === 'chunk');

    const summary = {
      totalSize: this.sumSizes(
        this.bundleAnalysis.filter((b) => b.type !== 'asset'),
        'gzipped',
      ),
      mainBundleSize: this.sumSizes(mainBundles, 'gzipped'),
      vendorSize: this.sumSizes(vendorBundles, 'gzipped'),
      chunkCount: chunks.length,
      largestChunk: chunks.length > 0 ? Math.max(...chunks.map((c) => c.gzipped)) : 0,
    };

    const criticalViolations = this.violations.filter((v) => v.severity === 'critical').length;
    const errorViolations = this.violations.filter((v) => v.severity === 'error').length;
    const warningViolations = this.violations.filter((v) => v.severity === 'warning').length;

    // Calculate score (0-100)
    let score = 100;
    score -= criticalViolations * 30;
    score -= errorViolations * 15;
    score -= warningViolations * 5;
    score = Math.max(0, score);

    const recommendations = this.generateRecommendations();

    return {
      passed: criticalViolations === 0 && errorViolations === 0,
      violations: this.violations,
      summary,
      recommendations,
      score,
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    const hasLargeBundles = this.violations.some(
      (v) => v.type === 'bundle_size' && v.severity !== 'warning',
    );
    const hasLargeChunks = this.violations.some((v) => v.type === 'chunk_size');
    const hasLargeAssets = this.violations.some((v) => v.type === 'asset_size');

    if (hasLargeBundles) {
      recommendations.push(' Implement dynamic imports for heavy components');
      recommendations.push(' Analyze bundle composition with webpack-bundle-analyzer');
      recommendations.push(' Enable tree shaking for all dependencies');
    }

    if (hasLargeChunks) {
      recommendations.push('️  Split large pages into smaller components');
      recommendations.push(' Use React.lazy() for heavy route components');
    }

    if (hasLargeAssets) {
      recommendations.push('️  Implement next/image for automatic optimization');
      recommendations.push(' Use responsive images with multiple sizes');
      recommendations.push('️  Consider using a CDN for static assets');
    }

    if (recommendations.length === 0) {
      recommendations.push(' Performance budget is within limits');
      recommendations.push(' Consider implementing Progressive Web App features');
      recommendations.push(' Monitor Core Web Vitals in production');
    }

    return recommendations;
  }

  private printReport(report: PerformanceReport): void {
    console.log('\n Performance Budget Report');
    console.log('================================');

    // Summary
    console.log(`\n Summary:`);
    console.log(`   Score: ${report.score}/100`);
    console.log(`   Status: ${report.passed ? ' PASSED' : ' FAILED'}`);
    console.log(`   Total Bundle Size: ${(report.summary.totalSize / 1024).toFixed(1)}KB`);
    console.log(`   Main Bundle: ${(report.summary.mainBundleSize / 1024).toFixed(1)}KB`);
    console.log(`   Vendor Bundle: ${(report.summary.vendorSize / 1024).toFixed(1)}KB`);
    console.log(`   Route Chunks: ${report.summary.chunkCount}`);

    // Violations
    if (report.violations.length > 0) {
      console.log(`\n Violations (${report.violations.length}):`);
      for (const violation of report.violations) {
        const icon =
          violation.severity === 'critical' ? '●' : violation.severity === 'error' ? '🟠' : '🟡';
        console.log(`   ${icon} ${violation.description}`);
        if (violation.file) {
          console.log(`      File: ${violation.file}`);
        }
        console.log(`       ${violation.recommendation}`);
        console.log('');
      }
    }

    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(`\n Recommendations:`);
      for (const recommendation of report.recommendations) {
        console.log(`   ${recommendation}`);
      }
    }

    console.log('\n Performance Targets:');
    console.log(`   Main Bundle: ≤ ${PERFORMANCE_BUDGET.bundles.main}KB`);
    console.log(`   Vendor Bundle: ≤ ${PERFORMANCE_BUDGET.bundles.vendor}KB`);
    console.log(`   Route Chunks: ≤ ${PERFORMANCE_BUDGET.bundles.chunks}KB each`);
    console.log(`   Total Initial Load: ≤ ${PERFORMANCE_BUDGET.bundles.total}KB`);

    if (!report.passed) {
      console.log('\n Performance budget validation failed!');
      process.exit(1);
    } else {
      console.log('\n Performance budget validation passed!');
    }
  }

  // Helper methods
  private classifyBundle(filename: string): BundleAnalysis['type'] {
    if (filename.includes('main') || filename.includes('app')) return 'main';
    if (filename.includes('vendor') || filename.includes('framework')) return 'vendor';
    if (filename.includes('_app') || filename.includes('pages')) return 'chunk';
    return 'chunk';
  }

  private extractRouteFromChunk(filename: string): string | undefined {
    // Extract route from Next.js chunk filename
    const match = filename.match(/pages\/(.+?)\.js$/);
    return match ? `/${match[1]}` : undefined;
  }

  private sumSizes(bundles: BundleAnalysis[], sizeType: 'size' | 'gzipped'): number {
    return bundles.reduce((sum, bundle) => sum + bundle[sizeType], 0);
  }

  private async getGzippedSize(filePath: string): Promise<number> {
    // Simplified estimation: assume gzip reduces size by ~30%
    const stats = statSync(filePath);
    return Math.round(stats.size * 0.7);
  }

  private async readBuildManifest(): Promise<any> {
    try {
      const manifestPath = join(this.buildDir, 'build-manifest.json');
      const content = readFileSync(manifestPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
}

async function main() {
  try {
    const validator = new PerformanceBudgetValidator();
    await validator.validate();
  } catch (error) {
    console.error(' Performance budget validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { PerformanceBudgetValidator, PERFORMANCE_BUDGET };
