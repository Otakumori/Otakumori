#!/usr/bin/env tsx

import { ProceduralTextureGenerator, TEXTURE_PRESETS } from '../lib/textures/procedural';
import * as THREE from 'three';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface TextureAsset {
  name: string;
  type: 'petal' | 'matcap' | 'toonRamp' | 'background';
  theme: string;
  format: 'png' | 'jpg' | 'ktx2';
  size: { width: number; height: number };
  path: string;
}

class TextureAssetPipeline {
  private generator: ProceduralTextureGenerator;
  private outputDir: string;
  private assets: TextureAsset[] = [];

  constructor(outputDir: string = 'public/textures') {
    this.generator = new ProceduralTextureGenerator();
    this.outputDir = outputDir;

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
  }

  async generateAllTextures(): Promise<void> {
    console.log('🌸 Starting texture generation pipeline...');

    // Generate textures for each theme
    for (const [themeName, presets] of Object.entries(TEXTURE_PRESETS)) {
      console.log(`\n📦 Generating textures for theme: ${themeName}`);

      for (const [textureType, config] of Object.entries(presets)) {
        await this.generateTexture(themeName, textureType as keyof typeof presets, config);
      }
    }

    // Generate additional utility textures
    await this.generateUtilityTextures();

    // Generate manifest
    await this.generateManifest();

    console.log('\n✅ Texture generation complete!');
    console.log(`📁 Generated ${this.assets.length} textures in ${this.outputDir}`);
  }

  private async generateTexture(
    theme: string,
    type: keyof typeof TEXTURE_PRESETS.cherryBlossom,
    config: any,
  ): Promise<void> {
    console.log(`  🎨 Generating ${type} texture...`);

    let texture: THREE.Texture;

    switch (type) {
      case 'petal':
        texture = this.generator.generatePetalTexture(config);
        break;
      case 'matcap':
        texture = this.generator.generateMatcapTexture(config);
        break;
      case 'toonRamp':
        texture = this.generator.generateToonRampTexture(config);
        break;
      case 'background':
        texture = this.generator.generateBackgroundTexture(config);
        break;
      default:
        throw new Error(`Unknown texture type: ${type}`);
    }

    // Convert to canvas and save as PNG
    const canvas = this.textureToCanvas(texture);
    const filename = `${theme}-${type}.png`;
    const filepath = join(this.outputDir, filename);

    // Save as PNG
    const pngBuffer = canvas.toBuffer('image/png');
    writeFileSync(filepath, pngBuffer);

    // Record asset
    this.assets.push({
      name: filename,
      type: type as any,
      theme,
      format: 'png',
      size: { width: config.width, height: config.height },
      path: `/textures/${filename}`,
    });

    console.log(`    ✅ Saved: ${filename}`);
  }

  private async generateUtilityTextures(): Promise<void> {
    console.log('\n🔧 Generating utility textures...');

    // Noise texture for effects
    const noiseTexture = this.generateNoiseTexture(512, 512);
    const noiseCanvas = this.textureToCanvas(noiseTexture);
    const noisePath = join(this.outputDir, 'noise.png');
    writeFileSync(noisePath, noiseCanvas.toBuffer('image/png'));

    this.assets.push({
      name: 'noise.png',
      type: 'background',
      theme: 'utility',
      format: 'png',
      size: { width: 512, height: 512 },
      path: '/textures/noise.png',
    });

    // Gradient ramp for toon shading
    const gradientTexture = this.generateGradientTexture(256, 64);
    const gradientCanvas = this.textureToCanvas(gradientTexture);
    const gradientPath = join(this.outputDir, 'gradient-ramp.png');
    writeFileSync(gradientPath, gradientCanvas.toBuffer('image/png'));

    this.assets.push({
      name: 'gradient-ramp.png',
      type: 'toonRamp',
      theme: 'utility',
      format: 'png',
      size: { width: 256, height: 64 },
      path: '/textures/gradient-ramp.png',
    });

    console.log('    ✅ Generated utility textures');
  }

  private generateNoiseTexture(width: number, height: number): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random();
      data[i] = noise * 255; // R
      data[i + 1] = noise * 255; // G
      data[i + 2] = noise * 255; // B
      data[i + 3] = 255; // A
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;

    return texture;
  }

  private generateGradientTexture(width: number, height: number): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.5, '#808080');
    gradient.addColorStop(1, '#ffffff');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;

    return texture;
  }

  private textureToCanvas(texture: THREE.Texture): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Get the canvas from the texture
    const sourceCanvas = texture.source.data as HTMLCanvasElement;
    if (sourceCanvas) {
      canvas.width = sourceCanvas.width;
      canvas.height = sourceCanvas.height;
      ctx.drawImage(sourceCanvas, 0, 0);
    } else {
      // Fallback: create a simple colored canvas
      canvas.width = 256;
      canvas.height = 256;
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(0, 0, 256, 256);
    }

    return canvas;
  }

  private async generateManifest(): Promise<void> {
    const manifest = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      textures: this.assets,
      themes: Object.keys(TEXTURE_PRESETS),
      usage: {
        petal: 'Use for individual petal instances in WebGL scenes',
        matcap: 'Use for matcap shading on 3D objects',
        toonRamp: 'Use for toon shading gradients',
        background: 'Use for parallax background layers',
      },
    };

    const manifestPath = join(this.outputDir, 'textures.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log('📋 Generated texture manifest');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const outputDir = args[0] || 'public/textures';

  console.log('🌸 Otaku-mori Texture Generation Pipeline');
  console.log('==========================================');

  const pipeline = new TextureAssetPipeline(outputDir);
  await pipeline.generateAllTextures();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { TextureAssetPipeline };
