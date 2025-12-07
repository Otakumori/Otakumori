/**
 * Sprite Sheet Atlas Generator
 * Combines individual sprite frames into a single sprite sheet atlas
 */

import type { SpriteFrame, AnimationState, SpriteDirection } from './spriteGenerator';

export interface FrameMetadata {
  animationState: AnimationState;
  direction: SpriteDirection;
  frameIndex: number;
  x: number; // Position in atlas
  y: number;
  width: number;
  height: number;
}

export interface SpriteAtlas {
  imageData: string; // base64 data URL
  frameWidth: number;
  frameHeight: number;
  atlasWidth: number;
  atlasHeight: number;
  frames: FrameMetadata[];
}

/**
 * Combine sprite frames into a sprite sheet atlas
 */
export async function createSpriteAtlas(
  frames: SpriteFrame[],
  frameWidth: number,
  frameHeight: number,
): Promise<SpriteAtlas> {
  if (frames.length === 0) {
    throw new Error('Cannot create atlas from empty frames array');
  }

  // Calculate optimal grid layout
  const frameCount = frames.length;
  const cols = Math.ceil(Math.sqrt(frameCount));
  const rows = Math.ceil(frameCount / cols);

  const atlasWidth = cols * frameWidth;
  const atlasHeight = rows * frameHeight;

  // Create canvas for atlas
  const canvas = document.createElement('canvas');
  canvas.width = atlasWidth;
  canvas.height = atlasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context for sprite atlas');
  }

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, atlasWidth, atlasHeight);

  // Draw each frame to the atlas
  const frameMetadata: FrameMetadata[] = [];

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const col = i % cols;
    const row = Math.floor(i / cols);

    const x = col * frameWidth;
    const y = row * frameHeight;

    // Load frame image
    const img = await loadImageFromData(frame.imageData);

    // Draw frame to atlas
    ctx.drawImage(img, x, y, frameWidth, frameHeight);

    // Store frame metadata
    frameMetadata.push({
      animationState: frame.animationState,
      direction: frame.direction,
      frameIndex: frame.frameIndex,
      x,
      y,
      width: frameWidth,
      height: frameHeight,
    });
  }

  // Convert canvas to base64 data URL
  const imageData = canvas.toDataURL('image/png');

  return {
    imageData,
    frameWidth,
    frameHeight,
    atlasWidth,
    atlasHeight,
    frames: frameMetadata,
  };
}

/**
 * Load image from base64 data URL or ImageData
 */
function loadImageFromData(data: string | ImageData): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = (error) => reject(new Error(`Failed to load image: ${error}`));

    if (typeof data === 'string') {
      // Base64 data URL
      img.src = data;
    } else {
      // ImageData - convert to data URL
      const canvas = document.createElement('canvas');
      canvas.width = data.width;
      canvas.height = data.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.putImageData(data, 0, 0);
      img.src = canvas.toDataURL('image/png');
    }
  });
}

/**
 * Get frame metadata for a specific animation state and direction
 */
export function getFrameMetadata(
  atlas: SpriteAtlas,
  animationState: AnimationState,
  direction: SpriteDirection,
  frameIndex: number,
): FrameMetadata | null {
  return (
    atlas.frames.find(
      (frame) =>
        frame.animationState === animationState &&
        frame.direction === direction &&
        frame.frameIndex === frameIndex,
    ) || null
  );
}

/**
 * Get all frames for an animation state and direction
 */
export function getAnimationFrames(
  atlas: SpriteAtlas,
  animationState: AnimationState,
  direction: SpriteDirection,
): FrameMetadata[] {
  return atlas.frames.filter(
    (frame) => frame.animationState === animationState && frame.direction === direction,
  );
}

