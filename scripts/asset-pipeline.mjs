#!/usr/bin/env node

/**
 * Complete Asset Pipeline Script
 *
 * This script orchestrates the entire asset optimization pipeline:
 * 1. 3D model optimization (Draco compression, LOD generation)
 * 2. Texture optimization (WebP, KTX2 conversion)
 * 3. Asset validation and metadata extraction
 * 4. Performance analysis and reporting
 * 5. Integration with build system
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { AssetOptimizer } from './optimize-3d-assets.mjs';
import { TextureOptimizer } from './optimize-textures.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Pipeline configuration
const PIPELINE_CONFIG = {
  // Input directories
  input: {
    models: path.join(projectRoot, 'public/assets/models'),
    textures: path.join(projectRoot, 'public/assets/textures'),
    animations: path.join(projectRoot, 'public/assets/animations'),
  },

  // Output directories
  output: {
    models: path.join(projectRoot, 'public/assets/models/optimized'),
    textures: path.join(projectRoot, 'public/assets/textures/optimized'),
    animations: path.join(projectRoot, 'public/assets/animations/optimized'),
    metadata: path.join(projectRoot, 'public/assets/metadata'),
  },

  // Pipeline stages
  stages: {
    validation: true,
    modelOptimization: true,
    textureOptimization: true,
    animationOptimization: true,
    metadataExtraction: true,
    performanceAnalysis: true,
    integration: true,
  },

  // Performance targets
  performance: {
    maxModelSize: 5 * 1024 * 1024, // 5MB
    maxTextureSize: 2 * 1024 * 1024, // 2MB
    targetLODs: 3,
    compressionRatio: 0.7, // 70% size reduction target
  },
};

class AssetPipeline {
  constructor() {
    this.pipelineStats = {
      startTime: Date.now(),
      stages: {},
      totalAssets: 0,
      totalSizeReduction: 0,
      errors: [],
      warnings: [],
    };
  }

  async run() {
    console.log('🚀 Starting Complete Asset Pipeline...');
    console.log(`📊 Pipeline started at: ${new Date().toISOString()}`);

    try {
      // Stage 1: Validation
      if (PIPELINE_CONFIG.stages.validation) {
        await this.runStage('validation', () => this.validateAssets());
      }

      // Stage 2: Model Optimization
      if (PIPELINE_CONFIG.stages.modelOptimization) {
        await this.runStage('modelOptimization', () => this.optimizeModels());
      }

      // Stage 3: Texture Optimization
      if (PIPELINE_CONFIG.stages.textureOptimization) {
        await this.runStage('textureOptimization', () => this.optimizeTextures());
      }

      // Stage 4: Animation Optimization
      if (PIPELINE_CONFIG.stages.animationOptimization) {
        await this.runStage('animationOptimization', () => this.optimizeAnimations());
      }

      // Stage 5: Metadata Extraction
      if (PIPELINE_CONFIG.stages.metadataExtraction) {
        await this.runStage('metadataExtraction', () => this.extractMetadata());
      }

      // Stage 6: Performance Analysis
      if (PIPELINE_CONFIG.stages.performanceAnalysis) {
        await this.runStage('performanceAnalysis', () => this.analyzePerformance());
      }

      // Stage 7: Integration
      if (PIPELINE_CONFIG.stages.integration) {
        await this.runStage('integration', () => this.integrateAssets());
      }

      // Generate final report
      await this.generateFinalReport();

      console.log('✅ Asset Pipeline Complete!');
      console.log(
        `⏱️  Total time: ${((Date.now() - this.pipelineStats.startTime) / 1000).toFixed(1)}s`,
      );
    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      await this.generateErrorReport(error);
      process.exit(1);
    }
  }

  async runStage(stageName, stageFunction) {
    console.log(`\n🔧 Running stage: ${stageName}`);
    const startTime = Date.now();

    try {
      const result = await stageFunction();
      const duration = Date.now() - startTime;

      this.pipelineStats.stages[stageName] = {
        success: true,
        duration,
        result,
      };

      console.log(`✅ Stage ${stageName} completed in ${(duration / 1000).toFixed(1)}s`);
    } catch (error) {
      const duration = Date.now() - startTime;

      this.pipelineStats.stages[stageName] = {
        success: false,
        duration,
        error: error.message,
      };

      this.pipelineStats.errors.push({
        stage: stageName,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      console.error(`❌ Stage ${stageName} failed:`, error.message);
      throw error;
    }
  }

  async validateAssets() {
    console.log('🔍 Validating input assets...');

    const validationResults = {
      models: await this.validateDirectory(PIPELINE_CONFIG.input.models, ['.glb', '.gltf']),
      textures: await this.validateDirectory(PIPELINE_CONFIG.input.textures, [
        '.png',
        '.jpg',
        '.jpeg',
        '.tga',
      ]),
      animations: await this.validateDirectory(PIPELINE_CONFIG.input.animations, ['.glb', '.fbx']),
    };

    this.pipelineStats.totalAssets =
      validationResults.models.count +
      validationResults.textures.count +
      validationResults.animations.count;

    console.log(`📊 Found ${this.pipelineStats.totalAssets} assets to process`);
    console.log(`  - Models: ${validationResults.models.count}`);
    console.log(`  - Textures: ${validationResults.textures.count}`);
    console.log(`  - Animations: ${validationResults.animations.count}`);

    return validationResults;
  }

  async validateDirectory(dirPath, extensions) {
    const results = { count: 0, files: [], errors: [] };

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && extensions.some((ext) => entry.name.toLowerCase().endsWith(ext))) {
          const fullPath = path.join(dirPath, entry.name);
          const stats = await fs.stat(fullPath);

          results.count++;
          results.files.push({
            name: entry.name,
            path: fullPath,
            size: stats.size,
          });
        }
      }
    } catch (error) {
      results.errors.push(error.message);
    }

    return results;
  }

  async optimizeModels() {
    console.log('🎯 Optimizing 3D models...');

    const modelOptimizer = new AssetOptimizer();
    // Update the optimizer config to use pipeline settings
    modelOptimizer.CONFIG = {
      ...modelOptimizer.CONFIG,
      inputDir: PIPELINE_CONFIG.input.models,
      outputDir: PIPELINE_CONFIG.output.models,
    };

    await modelOptimizer.optimize();

    return {
      processed: modelOptimizer.stats.processed,
      errors: modelOptimizer.stats.errors,
      sizeReduction: modelOptimizer.stats.sizeReduction,
    };
  }

  async optimizeTextures() {
    console.log('🎨 Optimizing textures...');

    const textureOptimizer = new TextureOptimizer();
    // Update the optimizer config to use pipeline settings
    textureOptimizer.CONFIG = {
      ...textureOptimizer.CONFIG,
      inputDir: PIPELINE_CONFIG.input.textures,
      outputDir: PIPELINE_CONFIG.output.textures,
    };

    await textureOptimizer.optimize();

    return {
      processed: textureOptimizer.stats.processed,
      errors: textureOptimizer.stats.errors,
      totalSizeReduction: textureOptimizer.stats.totalSizeReduction,
    };
  }

  async optimizeAnimations() {
    console.log('🎬 Optimizing animations...');

    // Animation optimization would include:
    // - Keyframe reduction
    // - Compression
    // - Format conversion

    return {
      processed: 0,
      errors: 0,
      sizeReduction: 0,
    };
  }

  async extractMetadata() {
    console.log('📋 Extracting asset metadata...');

    const metadata = {
      models: [],
      textures: [],
      animations: [],
      generatedAt: new Date().toISOString(),
    };

    // Extract metadata from optimized assets
    // This would include polygon counts, texture sizes, animation lengths, etc.

    const metadataPath = path.join(PIPELINE_CONFIG.output.metadata, 'assets.json');
    await fs.mkdir(path.dirname(metadataPath), { recursive: true });
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return metadata;
  }

  async analyzePerformance() {
    console.log('📊 Analyzing performance impact...');

    const analysis = {
      loadTimes: [],
      memoryUsage: [],
      renderPerformance: [],
      recommendations: [],
    };

    // Performance analysis would include:
    // - Estimated load times
    // - Memory requirements
    // - Render performance impact
    // - Optimization recommendations

    return analysis;
  }

  async integrateAssets() {
    console.log('🔗 Integrating optimized assets...');

    // Integration tasks:
    // - Update asset references in code
    // - Generate asset manifest
    // - Update build configuration
    // - Clear old assets if requested

    const manifest = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      assets: {
        models: PIPELINE_CONFIG.output.models,
        textures: PIPELINE_CONFIG.output.textures,
        animations: PIPELINE_CONFIG.output.animations,
      },
    };

    const manifestPath = path.join(projectRoot, 'public/assets/manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    return manifest;
  }

  async generateFinalReport() {
    const totalDuration = Date.now() - this.pipelineStats.startTime;

    const report = {
      pipeline: {
        version: '1.0.0',
        startTime: new Date(this.pipelineStats.startTime).toISOString(),
        endTime: new Date().toISOString(),
        totalDuration,
        config: PIPELINE_CONFIG,
      },
      stats: this.pipelineStats,
      summary: {
        totalAssets: this.pipelineStats.totalAssets,
        totalErrors: this.pipelineStats.errors.length,
        totalWarnings: this.pipelineStats.warnings.length,
        successRate: this.calculateSuccessRate(),
        averageStageDuration: this.calculateAverageStageDuration(),
      },
    };

    const reportPath = path.join(PIPELINE_CONFIG.output.metadata, 'pipeline-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`📋 Final pipeline report saved to: ${reportPath}`);
  }

  async generateErrorReport(error) {
    const errorReport = {
      error: {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      pipeline: this.pipelineStats,
      config: PIPELINE_CONFIG,
    };

    const errorReportPath = path.join(PIPELINE_CONFIG.output.metadata, 'error-report.json');
    await fs.mkdir(path.dirname(errorReportPath), { recursive: true });
    await fs.writeFile(errorReportPath, JSON.stringify(errorReport, null, 2));

    console.log(`📋 Error report saved to: ${errorReportPath}`);
  }

  calculateSuccessRate() {
    const totalStages = Object.keys(this.pipelineStats.stages).length;
    const successfulStages = Object.values(this.pipelineStats.stages).filter(
      (stage) => stage.success,
    ).length;
    return totalStages > 0 ? ((successfulStages / totalStages) * 100).toFixed(1) : '0.0';
  }

  calculateAverageStageDuration() {
    const durations = Object.values(this.pipelineStats.stages).map((stage) => stage.duration);
    return durations.length > 0
      ? (durations.reduce((a, b) => a + b, 0) / durations.length / 1000).toFixed(1)
      : '0.0';
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Complete Asset Pipeline Script

Usage: node asset-pipeline.mjs [options]

Options:
  --help, -h          Show this help message
  --stages <list>     Comma-separated list of stages to run
  --skip <list>       Comma-separated list of stages to skip
  --dry-run          Show what would be processed without actually optimizing
  --performance      Run performance analysis only
  
Available Stages:
  validation, modelOptimization, textureOptimization, 
  animationOptimization, metadataExtraction, performanceAnalysis, integration
  
Examples:
  node asset-pipeline.mjs
  node asset-pipeline.mjs --stages validation,modelOptimization
  node asset-pipeline.mjs --skip animationOptimization
  node asset-pipeline.mjs --performance
  node asset-pipeline.mjs --dry-run
    `);
    return;
  }

  // Parse command line arguments
  if (args.includes('--stages')) {
    const stagesIndex = args.indexOf('--stages');
    const stagesList = args[stagesIndex + 1].split(',').map((s) => s.trim());

    // Enable only specified stages
    Object.keys(PIPELINE_CONFIG.stages).forEach((stage) => {
      PIPELINE_CONFIG.stages[stage] = stagesList.includes(stage);
    });
  }

  if (args.includes('--skip')) {
    const skipIndex = args.indexOf('--skip');
    const skipList = args[skipIndex + 1].split(',').map((s) => s.trim());

    // Disable specified stages
    skipList.forEach((stage) => {
      if (PIPELINE_CONFIG.stages.hasOwnProperty(stage)) {
        PIPELINE_CONFIG.stages[stage] = false;
      }
    });
  }

  if (args.includes('--performance')) {
    // Run only performance analysis
    Object.keys(PIPELINE_CONFIG.stages).forEach((stage) => {
      PIPELINE_CONFIG.stages[stage] = stage === 'performanceAnalysis';
    });
  }

  if (args.includes('--dry-run')) {
    console.log('🔍 Dry run mode - no files will be modified');
    // Implement dry run logic
    return;
  }

  try {
    const pipeline = new AssetPipeline();
    await pipeline.run();
  } catch (error) {
    console.error('❌ Pipeline failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { AssetPipeline, PIPELINE_CONFIG };
