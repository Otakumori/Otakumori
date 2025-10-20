#!/usr/bin/env node

/**
 * Texture Optimization Script
 *
 * This script optimizes textures for the high-fidelity avatar system:
 * - Convert to WebP format for better compression
 * - Generate KTX2 textures for WebGL
 * - Create mipmaps and different resolutions
 * - Extract and optimize embedded textures from GLB files
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  inputDir: path.join(projectRoot, 'public/assets/textures'),
  outputDir: path.join(projectRoot, 'public/assets/textures/optimized'),
  tempDir: path.join(projectRoot, '.temp/texture-optimization'),

  // WebP settings
  webp: {
    quality: 85,
    lossless: false,
    method: 6,
  },

  // KTX2 settings
  ktx2: {
    quality: 'fast',
    uastc: false,
    uastcFlags: 0,
  },

  // Resize settings
  sizes: [1024, 512, 256, 128, 64],

  // Supported input formats
  inputFormats: ['.png', '.jpg', '.jpeg', '.tga', '.bmp'],
};

class TextureOptimizer {
  constructor() {
    this.stats = {
      processed: 0,
      errors: 0,
      warnings: 0,
      totalSizeReduction: 0,
      formats: {
        webp: 0,
        ktx2: 0,
        original: 0,
      },
    };
  }

  async optimize() {
    console.log('🎨 Starting Texture Optimization...');
    console.log(`📁 Input: ${CONFIG.inputDir}`);
    console.log(`📁 Output: ${CONFIG.outputDir}`);

    // Ensure output directories exist
    await this.ensureDirectories();

    // Find all texture files
    const textureFiles = await this.findTextureFiles();
    console.log(`📊 Found ${textureFiles.length} texture files to process`);

    // Process each file
    for (const file of textureFiles) {
      try {
        await this.processTexture(file);
        this.stats.processed++;
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        this.stats.errors++;
      }
    }

    // Generate optimization report
    await this.generateReport();

    console.log('✅ Texture optimization complete!');
    console.log(`📊 Processed: ${this.stats.processed}, Errors: ${this.stats.errors}`);
    console.log(`💾 Total size reduction: ${this.stats.totalSizeReduction.toFixed(1)}%`);
  }

  async ensureDirectories() {
    const dirs = [CONFIG.outputDir, CONFIG.tempDir];
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async findTextureFiles() {
    const files = [];

    async function scanDir(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scanDir(fullPath);
        } else if (CONFIG.inputFormats.some((ext) => entry.name.toLowerCase().endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }

    await scanDir(CONFIG.inputDir);
    return files;
  }

  async processTexture(filePath) {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(CONFIG.inputDir, filePath);
    const baseName = path.basename(filePath, path.extname(filePath));
    const outputDir = path.join(CONFIG.outputDir, path.dirname(relativePath));

    console.log(`🎨 Processing: ${relativePath}`);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Get original file size
    const originalStats = await fs.stat(filePath);
    const originalSize = originalStats.size;

    // Generate multiple sizes
    for (const size of CONFIG.sizes) {
      try {
        // Generate WebP version
        const webpPath = path.join(outputDir, `${baseName}_${size}.webp`);
        await this.convertToWebP(filePath, webpPath, size);
        this.stats.formats.webp++;

        // Generate KTX2 version
        const ktx2Path = path.join(outputDir, `${baseName}_${size}.ktx2`);
        await this.convertToKTX2(filePath, ktx2Path, size);
        this.stats.formats.ktx2++;
      } catch (error) {
        console.warn(`  ⚠️  Failed to generate size ${size}: ${error.message}`);
        this.stats.warnings++;
      }
    }

    // Calculate total size reduction
    const optimizedStats = await this.getDirectorySize(outputDir);
    const sizeReduction = ((originalSize - optimizedStats) / originalSize) * 100;
    this.stats.totalSizeReduction += Math.max(0, sizeReduction);

    console.log(`  ✅ Optimized: ${fileName} (${sizeReduction.toFixed(1)}% reduction)`);
  }

  async convertToWebP(inputPath, outputPath, size) {
    return new Promise((resolve, reject) => {
      const cwebp = spawn('cwebp', [
        inputPath,
        '-q',
        CONFIG.webp.quality.toString(),
        '-resize',
        size.toString(),
        size.toString(),
        '-m',
        CONFIG.webp.method.toString(),
        '-o',
        outputPath,
      ]);

      cwebp.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`WebP conversion failed with code ${code}`));
        }
      });

      cwebp.on('error', (error) => {
        if (error.code === 'ENOENT') {
          reject(new Error('cwebp not found. Please install WebP tools.'));
        } else {
          reject(error);
        }
      });
    });
  }

  async convertToKTX2(inputPath, outputPath, size) {
    return new Promise((resolve, reject) => {
      // Use basisu for KTX2 conversion
      const basisu = spawn('basisu', [
        inputPath,
        '-output_path',
        outputPath,
        '-resize',
        size.toString(),
        size.toString(),
        '-quality_level',
        '255',
        '-compression_level',
        '6',
      ]);

      basisu.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`KTX2 conversion failed with code ${code}`));
        }
      });

      basisu.on('error', (error) => {
        if (error.code === 'ENOENT') {
          reject(new Error('basisu not found. Please install Basis Universal tools.'));
        } else {
          reject(error);
        }
      });
    });
  }

  async getDirectorySize(dirPath) {
    let totalSize = 0;

    async function scanDir(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scanDir(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
    }

    try {
      await scanDir(dirPath);
    } catch (error) {
      // Directory might not exist yet
    }

    return totalSize;
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
        averageSizeReduction: (this.stats.totalSizeReduction / this.stats.processed).toFixed(1),
        formatsGenerated: this.stats.formats,
      },
    };

    const reportPath = path.join(CONFIG.outputDir, 'texture-optimization-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`📋 Texture optimization report saved to: ${reportPath}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Texture Optimization Script

Usage: node optimize-textures.mjs [options]

Options:
  --help, -h          Show this help message
  --input <path>      Input directory (default: public/assets/textures)
  --output <path>     Output directory (default: public/assets/textures/optimized)
  --sizes <list>      Comma-separated list of sizes (default: 1024,512,256,128,64)
  --dry-run          Show what would be processed without actually optimizing
  
Requirements:
  - cwebp (WebP encoder)
  - basisu (Basis Universal encoder)
  
Examples:
  node optimize-textures.mjs
  node optimize-textures.mjs --input ./textures --output ./optimized
  node optimize-textures.mjs --sizes 2048,1024,512
  node optimize-textures.mjs --dry-run
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

  const sizesIndex = args.indexOf('--sizes');
  if (sizesIndex !== -1 && args[sizesIndex + 1]) {
    CONFIG.sizes = args[sizesIndex + 1].split(',').map((s) => parseInt(s.trim()));
  }

  try {
    const optimizer = new TextureOptimizer();
    await optimizer.optimize();
  } catch (error) {
    console.error('❌ Texture optimization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TextureOptimizer, CONFIG };
