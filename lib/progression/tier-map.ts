export type TierPreset = {
  hue: number;
  thickness: number;
  motion: 'none' | 'low' | 'med' | 'high';
  description: string;
  visualTheme: string;
};

export function tierPreset(tier: number): TierPreset {
  const presets: Record<number, TierPreset> = {
    1: {
      hue: 315,
      thickness: 1,
      motion: 'none',
      description: 'Fallen Leaf',
      visualTheme: 'thin ring, faint petals',
    },
    2: {
      hue: 320,
      thickness: 1.5,
      motion: 'none',
      description: 'Budding Warden',
      visualTheme: 'ring with tiny buds',
    },
    3: {
      hue: 325,
      thickness: 2,
      motion: 'low',
      description: 'Bloomtouched',
      visualTheme: 'blossom outline, soft pulse',
    },
    4: {
      hue: 330,
      thickness: 2.5,
      motion: 'low',
      description: 'Petalforged',
      visualTheme: 'metallic gradient, bevel',
    },
    5: {
      hue: 335,
      thickness: 3,
      motion: 'low',
      description: 'Rootkeeper',
      visualTheme: 'root interlace pattern',
    },
    6: {
      hue: 340,
      thickness: 3.5,
      motion: 'med',
      description: 'Warden of Bloom',
      visualTheme: 'petal rays radiating',
    },
    7: {
      hue: 345,
      thickness: 4,
      motion: 'med',
      description: 'Veilbloom',
      visualTheme: 'veil overlay, feathered',
    },
    8: {
      hue: 350,
      thickness: 4.5,
      motion: 'med',
      description: 'Thornbound',
      visualTheme: 'thorn overlays, glint',
    },
    9: {
      hue: 355,
      thickness: 5,
      motion: 'high',
      description: 'Aetherpetal',
      visualTheme: 'starfield speckle, twinkle',
    },
    10: {
      hue: 360,
      thickness: 6,
      motion: 'high',
      description: 'Eclipse',
      visualTheme: 'eclipse rim, outer glow',
    },
  };

  const preset = presets[tier];
  if (preset) return preset;
  return (
    presets[1] ?? {
      hue: 315,
      thickness: 1,
      motion: 'none',
      description: 'Fallen Leaf',
      visualTheme: 'thin ring, faint petals',
    }
  );
}

export function getTierMotionDuration(motion: 'none' | 'low' | 'med' | 'high'): number {
  switch (motion) {
    case 'none':
      return 0;
    case 'low':
      return 12; // 12-16s
    case 'med':
      return 14; // 12-14s
    case 'high':
      return 60; // 30-60s
    default:
      return 0;
  }
}

export function getTierOpacity(tier: number): number {
  // Early tiers more subtle, higher tiers more prominent
  return Math.min(0.9, 0.5 + tier * 0.04);
}
