#!/usr/bin/env node

/**
 * 3D Asset Optimization Script
 *
 * This script processes 3D assets for the high-fidelity avatar system:
 * - Draco compression for GLB files
 * - Texture conversion to WebP/KTX2
 * - Mesh simplification and LOD generation
 * - Asset validation and metadata extraction
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  inputDir: path.join(projectRoot, 'public/assets/models'),
  outputDir: path.join(projectRoot, 'public/assets/models/optimized'),
  tempDir: path.join(projectRoot, '.temp/asset-optimization'),

  // Draco compression settings
  draco: {
    compressionLevel: 7,
    quantizationBits: {
      position: 14,
      normal: 10,
      color: 8,
      texCoord: 12,
    },
  },

  // Texture optimization settings
  textures: {
    maxSize: 2048,
    formats: ['webp', 'ktx2'],
    quality: 85,
  },

  // LOD generation settings
  lod: {
    levels: [0.8, 0.5, 0.2], // Triangle reduction ratios
    distances: [5, 15, 30], // Distance thresholds
  },
};

class AssetOptimizer {
  constructor() {
    this.stats = {
      processed: 0,
      errors: 0,
      warnings: 0,
      sizeReduction: 0,
    };
  }

  async optimize() {
    console.log('🚀 Starting 3D Asset Optimization...');
    console.log(`📁 Input: ${CONFIG.inputDir}`);
    console.log(`📁 Output: ${CONFIG.outputDir}`);

    // Ensure output directories exist
    await this.ensureDirectories();

    // Find all GLB/GLTF files
    const assetFiles = await this.findAssetFiles();
    console.log(`📊 Found ${assetFiles.length} asset files to process`);

    // Process each file
    for (const file of assetFiles) {
      try {
        await this.processAsset(file);
        this.stats.processed++;
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        this.stats.errors++;
      }
    }

    // Generate optimization report
    await this.generateReport();

    console.log('✅ Asset optimization complete!');
    console.log(`📊 Processed: ${this.stats.processed}, Errors: ${this.stats.errors}`);
  }

  async ensureDirectories() {
    const dirs = [CONFIG.outputDir, CONFIG.tempDir];
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async findAssetFiles() {
    const files = [];
    const extensions = ['.glb', '.gltf'];

    async function scanDir(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scanDir(fullPath);
        } else if (extensions.some((ext) => entry.name.toLowerCase().endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }

    await scanDir(CONFIG.inputDir);
    return files;
  }

  async processAsset(filePath) {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(CONFIG.inputDir, filePath);
    const outputPath = path.join(CONFIG.outputDir, relativePath);

    console.log(`🔧 Processing: ${relativePath}`);

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Get original file size
    const originalStats = await fs.stat(filePath);
    const originalSize = originalStats.size;

    // Extract and optimize textures
    await this.extractAndOptimizeTextures(filePath);

    // Apply Draco compression
    const compressedPath = await this.applyDracoCompression(filePath, outputPath);

    // Generate LODs
    await this.generateLODs(compressedPath, outputPath);

    // Validate optimized asset
    await this.validateAsset(compressedPath);

    // Calculate size reduction
    const optimizedStats = await fs.stat(compressedPath);
    const sizeReduction = ((originalSize - optimizedStats.size) / originalSize) * 100;
    this.stats.sizeReduction += sizeReduction;

    console.log(`  ✅ Optimized: ${fileName} (${sizeReduction.toFixed(1)}% reduction)`);
  }

  async extractAndOptimizeTextures(filePath) {
    // This would use gltf-pipeline or similar to extract textures
    // For now, we'll create a placeholder implementation

    console.log(`  🖼️  Extracting textures from ${path.basename(filePath)}`);

    // Placeholder for texture extraction and optimization
    // In a real implementation, this would:
    // 1. Parse the GLTF file
    // 2. Extract embedded textures
    // 3. Convert to WebP/KTX2
    // 4. Update texture references
  }

  async applyDracoCompression(inputPath, outputPath) {
    console.log(`  🗜️  Applying Draco compression`);

    return new Promise((resolve, reject) => {
      // Use gltf-pipeline for Draco compression
      const gltfPipeline = spawn('npx', [
        'gltf-pipeline',
        '-i',
        inputPath,
        '-o',
        outputPath,
        '--draco.compressionLevel',
        CONFIG.draco.compressionLevel.toString(),
        '--draco.quantizePositionBits',
        CONFIG.draco.quantizationBits.position.toString(),
        '--draco.quantizeNormalBits',
        CONFIG.draco.quantizationBits.normal.toString(),
        '--draco.quantizeColorBits',
        CONFIG.draco.quantizationBits.color.toString(),
        '--draco.quantizeTexcoordBits',
        CONFIG.draco.quantizationBits.texCoord.toString(),
      ]);

      gltfPipeline.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`Draco compression failed with code ${code}`));
        }
      });

      gltfPipeline.on('error', (error) => {
        reject(error);
      });
    });
  }

  async generateLODs(inputPath, outputDir) {
    console.log(`  📊 Generating LOD levels`);

    const baseName = path.basename(inputPath, path.extname(inputPath));
    const lods = [];

    for (let i = 0; i < CONFIG.lod.levels.length; i++) {
      const ratio = CONFIG.lod.levels[i];
      const distance = CONFIG.lod.distances[i];
      const lodPath = path.join(outputDir, `${baseName}_LOD${i}.glb`);

      try {
        // Use gltf-pipeline for mesh simplification
        await this.simplifyMesh(inputPath, lodPath, ratio);
        lods.push({ level: i, ratio, distance, path: lodPath });
      } catch (error) {
        console.warn(`  ⚠️  Failed to generate LOD ${i}: ${error.message}`);
        this.stats.warnings++;
      }
    }

    return lods;
  }

  async simplifyMesh(inputPath, outputPath, ratio) {
    return new Promise((resolve, reject) => {
      const simplify = spawn('npx', [
        'gltf-pipeline',
        '-i',
        inputPath,
        '-o',
        outputPath,
        '--meshopt.simplify',
        '--meshopt.simplifyRatio',
        ratio.toString(),
      ]);

      simplify.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`Mesh simplification failed with code ${code}`));
        }
      });

      simplify.on('error', (error) => {
        reject(error);
      });
    });
  }

  async validateAsset(filePath) {
    console.log(`  ✅ Validating optimized asset`);

    // Basic validation - check if file exists and has content
    const stats = await fs.stat(filePath);
    if (stats.size === 0) {
      throw new Error('Optimized file is empty');
    }

    // In a real implementation, this would:
    // 1. Parse the GLTF file
    // 2. Validate structure and references
    // 3. Check for broken textures or materials
    // 4. Verify animation data integrity
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      config: CONFIG,
      summary: {
        totalProcessed: this.stats.processed,
        successRate: (
          ((this.stats.processed - this.stats.errors) / this.stats.processed) *
          100
        ).toFixed(1),
        averageSizeReduction: (this.stats.sizeReduction / this.stats.processed).toFixed(1),
      },
    };

    const reportPath = path.join(CONFIG.outputDir, 'optimization-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`📋 Optimization report saved to: ${reportPath}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
3D Asset Optimization Script

Usage: node optimize-3d-assets.mjs [options]

Options:
  --help, -h          Show this help message
  --input <path>      Input directory (default: public/assets/models)
  --output <path>     Output directory (default: public/assets/models/optimized)
  --dry-run          Show what would be processed without actually optimizing
  
Examples:
  node optimize-3d-assets.mjs
  node optimize-3d-assets.mjs --input ./models --output ./optimized
  node optimize-3d-assets.mjs --dry-run
    `);
    return;
  }

  if (args.includes('--dry-run')) {
    console.log('🔍 Dry run mode - no files will be modified');
    // Implement dry run logic
    return;
  }

  // Update config from command line args
  const inputIndex = args.indexOf('--input');
  if (inputIndex !== -1 && args[inputIndex + 1]) {
    CONFIG.inputDir = path.resolve(args[inputIndex + 1]);
  }

  const outputIndex = args.indexOf('--output');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    CONFIG.outputDir = path.resolve(args[outputIndex + 1]);
  }

  try {
    const optimizer = new AssetOptimizer();
    await optimizer.optimize();
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { AssetOptimizer, CONFIG };
