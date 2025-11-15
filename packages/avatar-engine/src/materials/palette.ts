/**
 * Nostalgic Palette System
 * Otaku-mori signature colors with mode-specific palettes
 */

import * as THREE from 'three';

export type PaletteMode = 'combat' | 'hub' | 'ui' | 'default';

export interface OtakumoriPalette {
  petals: string;
  blossoms: string;
  softPink: string;
  deepPurple: string;
  coolCharcoal: string;
  accent: string;
}

/**
 * Get Otaku-mori signature palette
 * Petals, blossoms, soft pinks, deep purples, cool charcoals
 */
export function getOtakumoriPalette(mode: PaletteMode = 'default'): OtakumoriPalette {
  const basePalette: OtakumoriPalette = {
    petals: '#ff69b4', // Hot pink
    blossoms: '#ffb6c1', // Light pink
    softPink: '#ffc0cb', // Pink
    deepPurple: '#8b5cf6', // Purple
    coolCharcoal: '#2d3748', // Dark grey
    accent: '#ec4899', // Pink accent
  };

  if (mode === 'combat') {
    // Deeper tones with sharp accents
    return {
      ...basePalette,
      deepPurple: '#6d28d9', // Deeper purple
      coolCharcoal: '#1a202c', // Darker charcoal
      accent: '#f43f5e', // Sharper pink-red accent
    };
  }

  if (mode === 'hub' || mode === 'ui') {
    // Glassy panels, soft neon glows
    return {
      ...basePalette,
      softPink: '#fce7f3', // Very light pink
      deepPurple: '#a78bfa', // Lighter purple
      coolCharcoal: '#374151', // Medium grey
      accent: '#f472b6', // Softer pink accent
    };
  }

  return basePalette;
}

/**
 * Convert palette to THREE.Color array
 */
export function paletteToColors(palette: OtakumoriPalette): THREE.Color[] {
  return [
    new THREE.Color(palette.petals),
    new THREE.Color(palette.blossoms),
    new THREE.Color(palette.softPink),
    new THREE.Color(palette.deepPurple),
    new THREE.Color(palette.coolCharcoal),
    new THREE.Color(palette.accent),
  ];
}

/**
 * Get color from palette by name
 */
export function getPaletteColor(palette: OtakumoriPalette, name: keyof OtakumoriPalette): THREE.Color {
  return new THREE.Color(palette[name]);
}

