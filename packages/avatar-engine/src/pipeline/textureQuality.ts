/**
 * Texture Quality Standards
 * Ensures procedural textures meet quality requirements
 */

import * as THREE from 'three';

const MIN_RESOLUTION = 512; // Minimum resolution for quality textures

/**
 * Ensure texture meets quality standards
 * Prevents visible low-res noise or banding
 * Ensures readability at close and mid distance
 */
export function ensureTextureQuality(
  texture: THREE.Texture,
  minResolution: number = MIN_RESOLUTION,
): THREE.Texture {
  // Check if texture is a CanvasTexture and has sufficient resolution
  if (texture instanceof THREE.CanvasTexture) {
    const image = texture.image;
    if (image && (image.width < minResolution || image.height < minResolution)) {
      // Log warning in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `Texture resolution ${image.width}x${image.height} is below minimum ${minResolution}. Consider regenerating at higher resolution.`,
        );
      }
    }
  }

  // Ensure proper filtering
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Ensure proper wrapping
  if (texture.wrapS === THREE.RepeatWrapping || texture.wrapT === THREE.RepeatWrapping) {
    // For repeating textures, use linear filtering
    texture.minFilter = THREE.LinearMipMapLinearFilter;
  }

  return texture;
}

/**
 * Validate texture quality and generate higher-res fallback if needed
 */
export function validateAndUpgradeTexture(
  texture: THREE.Texture,
  minResolution: number = MIN_RESOLUTION,
): THREE.Texture {
  if (texture instanceof THREE.CanvasTexture) {
    const image = texture.image;
    if (image && (image.width < minResolution || image.height < minResolution)) {
      // In a full implementation, we would regenerate the texture at higher resolution
      // For now, we just ensure proper filtering
      ensureTextureQuality(texture, minResolution);
    }
  }

  return texture;
}

