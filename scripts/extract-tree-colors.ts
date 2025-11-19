/**
 * Extract Color Palette from Cherry Tree Image
 * 
 * Dev-only script to extract pink/blossom colors from cherry tree image.
 * Run with: npx tsx scripts/extract-tree-colors.ts
 */

import { createCanvas, loadImage } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

// Cherry blossom color palette (extracted from tree image)
// These are approximate colors that match the tree's pink tones
export const CHERRY_TREE_PALETTE = {
  light: ['#FFB6C1', '#FFC0CB', '#FFD7E8', '#FFE4F0'], // Light pink variations
  medium: ['#FF91A4', '#FFA0B4', '#FFB3D9', '#F7BFD3'], // Medium pink variations
  dark: ['#EC4899', '#F472B6', '#FB7185', '#F43F5E'], // Dark pink variations
  accent: ['#FF4FA3', '#FF86C2', '#FF9FBE'], // Accent pinks
};

async function extractColors() {
  try {
    const imagePath = path.join(process.cwd(), 'public', 'assets', 'images', 'cherry-tree.png');
    
    if (!fs.existsSync(imagePath)) {
      console.warn('Tree image not found, using default palette');
      console.log('Default palette:', CHERRY_TREE_PALETTE);
      return CHERRY_TREE_PALETTE;
    }

    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(image, 0, 0);
    
    // Sample colors from top portion (where blossoms are)
    const sampleWidth = image.width;
    const sampleHeight = Math.floor(image.height * 0.4); // Top 40% where blossoms are
    
    const colorMap = new Map<string, number>();
    
    // Sample pixels from blossom area
    for (let y = 0; y < sampleHeight; y += 5) {
      for (let x = 0; x < sampleWidth; x += 5) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];
        const a = pixel[3];
        
        // Filter for pink tones (high red, medium green, medium-high blue)
        if (a > 128 && r > 200 && g > 100 && g < 200 && b > 150) {
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }
      }
    }
    
    // Sort by frequency and extract top colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([color]) => color);
    
    console.log('Extracted colors from tree:', sortedColors);
    return sortedColors;
  } catch (error) {
    console.error('Error extracting colors:', error);
    console.log('Using default palette:', CHERRY_TREE_PALETTE);
    return CHERRY_TREE_PALETTE;
  }
}

// Run if called directly
if (require.main === module) {
  extractColors().then((colors) => {
    console.log('\nFinal palette:', colors);
    process.exit(0);
  });
}

export default extractColors;

