/**
 * Anime-Style Filters
 * Post-processing filters to give textures an anime/manga aesthetic
 */

export interface AnimeFilterConfig {
  strength?: number;
  outlineColor?: string;
  highlightColor?: string;
  shadowColor?: string;
}

/**
 * Apply outline/ink effect (manga-style)
 */
export function applyInkOutline(
  imageData: ImageData,
  thickness: number = 2,
  color: string = '#000000',
): ImageData {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);

  // Parse outline color
  const outlineRgb = hexToRgb(color);

  // Edge detection (Sobel operator)
  for (let y = thickness; y < height - thickness; y++) {
    for (let x = thickness; x < width - thickness; x++) {
      let gx = 0;
      let gy = 0;

      // Calculate gradients
      for (let ky = -thickness; ky <= thickness; ky++) {
        for (let kx = -thickness; kx <= thickness; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const intensity = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

          gx += intensity * kx;
          gy += intensity * ky;
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);

      // If edge detected, draw outline
      if (magnitude > 50) {
        const index = (y * width + x) * 4;
        result.data[index] = outlineRgb.r;
        result.data[index + 1] = outlineRgb.g;
        result.data[index + 2] = outlineRgb.b;
      }
    }
  }

  return result;
}

/**
 * Apply screentone effect (manga halftone)
 */
export function applyScreentone(
  imageData: ImageData,
  dotSize: number = 4,
  spacing: number = 6,
): ImageData {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);

  for (let y = 0; y < height; y += spacing) {
    for (let x = 0; x < width; x += spacing) {
      // Sample brightness at this position
      const idx = (y * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      // Calculate dot radius based on brightness
      const radius = ((255 - brightness) / 255) * dotSize;

      // Draw dot
      for (let dy = 0; dy < spacing; dy++) {
        for (let dx = 0; dx < spacing; dx++) {
          const px = x + dx;
          const py = y + dy;

          if (px < width && py < height) {
            const dist = Math.sqrt(Math.pow(dx - spacing / 2, 2) + Math.pow(dy - spacing / 2, 2));

            if (dist < radius) {
              const index = (py * width + px) * 4;
              result.data[index] = 0;
              result.data[index + 1] = 0;
              result.data[index + 2] = 0;
            }
          }
        }
      }
    }
  }

  return result;
}

/**
 * Apply anime-style highlights (sharp specular highlights)
 */
export function applyAnimeHighlights(
  imageData: ImageData,
  config: AnimeFilterConfig = {},
): ImageData {
  const { strength = 0.3, highlightColor = '#ffffff' } = config;
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);

  const highlightRgb = hexToRgb(highlightColor);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      // Detect bright areas
      if (brightness > 200) {
        // Check neighbors to find local maxima
        let isLocalMax = true;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
            const neighborBrightness =
              (data[neighborIdx] + data[neighborIdx + 1] + data[neighborIdx + 2]) / 3;
            if (neighborBrightness > brightness) {
              isLocalMax = false;
              break;
            }
          }
          if (!isLocalMax) break;
        }

        // Add sharp highlight
        if (isLocalMax) {
          result.data[idx] = Math.round(
            result.data[idx] * (1 - strength) + highlightRgb.r * strength,
          );
          result.data[idx + 1] = Math.round(
            result.data[idx + 1] * (1 - strength) + highlightRgb.g * strength,
          );
          result.data[idx + 2] = Math.round(
            result.data[idx + 2] * (1 - strength) + highlightRgb.b * strength,
          );
        }
      }
    }
  }

  return result;
}

/**
 * Apply posterization (reduce color depth for anime look)
 */
export function applyPosterization(imageData: ImageData, levels: number = 8): ImageData {
  const { data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), imageData.width, imageData.height);

  for (let i = 0; i < data.length; i += 4) {
    result.data[i] = Math.floor((data[i] / 255) * levels) * Math.floor(255 / levels);
    result.data[i + 1] = Math.floor((data[i + 1] / 255) * levels) * Math.floor(255 / levels);
    result.data[i + 2] = Math.floor((data[i + 2] / 255) * levels) * Math.floor(255 / levels);
  }

  return result;
}

/**
 * Apply bloom effect (glowing highlights)
 */
export function applyBloom(
  imageData: ImageData,
  threshold: number = 200,
  intensity: number = 0.5,
): ImageData {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);

  // Create brightness map
  const brightPixels: { x: number; y: number; intensity: number }[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      if (brightness > threshold) {
        brightPixels.push({
          x,
          y,
          intensity: (brightness - threshold) / (255 - threshold),
        });
      }
    }
  }

  // Apply bloom from bright pixels
  for (const pixel of brightPixels) {
    const radius = 10 * pixel.intensity;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = pixel.x + dx;
        const py = pixel.y + dy;

        if (px >= 0 && px < width && py >= 0 && py < height) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius) {
            const falloff = 1 - dist / radius;
            const bloomStrength = falloff * pixel.intensity * intensity;

            const idx = (py * width + px) * 4;
            result.data[idx] = Math.min(
              255,
              result.data[idx] + data[(pixel.y * width + pixel.x) * 4] * bloomStrength,
            );
            result.data[idx + 1] = Math.min(
              255,
              result.data[idx + 1] + data[(pixel.y * width + pixel.x) * 4 + 1] * bloomStrength,
            );
            result.data[idx + 2] = Math.min(
              255,
              result.data[idx + 2] + data[(pixel.y * width + pixel.x) * 4 + 2] * bloomStrength,
            );
          }
        }
      }
    }
  }

  return result;
}

/**
 * Apply color banding (retro anime aesthetic)
 */
export function applyColorBanding(imageData: ImageData, bands: number = 3): ImageData {
  const { data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), imageData.width, imageData.height);

  const bandSize = 256 / bands;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Quantize to bands
    result.data[i] = Math.floor(r / bandSize) * bandSize;
    result.data[i + 1] = Math.floor(g / bandSize) * bandSize;
    result.data[i + 2] = Math.floor(b / bandSize) * bandSize;
  }

  return result;
}

/**
 * Apply speed lines effect (motion blur with anime style)
 */
export function applySpeedLines(
  imageData: ImageData,
  centerX: number,
  centerY: number,
  strength: number = 0.5,
): ImageData {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Sample along the radial direction
      const samples = 5;
      let r = 0,
        g = 0,
        b = 0;

      for (let s = 0; s < samples; s++) {
        const offset = (s * strength * 5) / samples;
        const sx = Math.round(x - Math.cos(angle) * offset);
        const sy = Math.round(y - Math.sin(angle) * offset);

        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
          const idx = (sy * width + sx) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
        }
      }

      const idx = (y * width + x) * 4;
      result.data[idx] = r / samples;
      result.data[idx + 1] = g / samples;
      result.data[idx + 2] = b / samples;
    }
  }

  return result;
}

// Helper function
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}
