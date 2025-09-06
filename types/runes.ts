// DEPRECATED: This component is a duplicate. Use lib\runes.ts instead.
// Canonical Rune IDs - stable identifiers for the system
export type CanonicalRuneId =
  | 'rune_a'
  | 'rune_b'
  | 'rune_c'
  | 'rune_d'
  | 'rune_e'
  | 'rune_f'
  | 'rune_g'
  | 'rune_h'
  | 'rune_i'
  | 'rune_j'
  | 'rune_k'
  | 'rune_l'
  | 'rune_m'
  | 'rune_n'
  | 'rune_o'
  | 'rune_p'
  | 'rune_q'
  | 'rune_r'
  | 'rune_s'
  | 'rune_t';

// Rune Definition - admin-editable display properties
export interface RuneDef {
  id: string;
  canonicalId: CanonicalRuneId;
  displayName?: string;
  glyph?: string;
  lore?: string;
  printifyUPCs: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Rune Combo Definition - sets of runes that unlock reveals
export interface RuneComboDef {
  id: string;
  comboId: string;
  members: CanonicalRuneId[];
  revealCopy?: string;
  cosmeticBurst?: 'small' | 'medium' | 'large';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User's acquired rune
export interface UserRune {
  id: string;
  userId: string;
  runeId: string;
  orderId?: string;
  acquiredAt: Date;
  rune: RuneDef;
}

// Rewards configuration
export interface RewardsConfig {
  baseRateCents: number; // 1 petal per $X (default: 300 = $3)
  minPerOrder: number; // Minimum petals per order (default: 5)
  maxPerOrder: number; // Maximum petals per order (default: 120)
  streak: {
    enabled: boolean; // Daily streak bonus
    dailyBonusPct: number; // Bonus per consecutive day (default: 0.05 = 5%)
    maxPct: number; // Maximum streak bonus (default: 0.25 = 25%)
  };
  seasonal: {
    multiplier: number; // Seasonal multiplier (default: 1.0)
  };
  daily: {
    softCap: number; // Soft daily cap (default: 200)
    postSoftRatePct: number; // Rate after soft cap (default: 0.5 = 50%)
    hardCap: number; // Hard daily cap (default: 400)
  };
  firstPurchaseBonus: number; // Bonus for first purchase (default: 20)
}

// Runes configuration
export interface RunesConfig {
  defs: RuneDef[];
  combos: RuneComboDef[];
  gacha: {
    enabled: boolean; // Random assignment for unmapped UPCs
  };
}

// Burst configuration
export interface BurstConfig {
  enabled: boolean;
  minCooldownSec: number; // Global cooldown between bursts
  maxPerMinute: number; // Maximum bursts per minute per user
  particleCount: {
    small: number;
    medium: number;
    large: number;
  };
  rarityWeights: {
    small: number;
    medium: number;
    large: number;
  };
}

// Tree configuration
export interface TreeConfig {
  sway: number; // 0.0 to 1.0 sway intensity
  spawnRate: number; // Milliseconds between spawns
  snapPx: number; // Vertex snapping grid size
  dither: number; // Dithering overlay opacity
}

// Theme configuration
export interface ThemeConfig {
  pinkIntensity: number; // 0.0 to 1.0 pink saturation
  grayIntensity: number; // 0.0 to 1.0 gray saturation
  motionIntensity: number; // 0 to 3 motion level
}

// Seasonal configuration
export interface SeasonalConfig {
  sakuraBoost: boolean; // Cherry blossom season multiplier
  springMode: boolean; // Spring theme activation
  autumnMode: boolean; // Autumn theme activation
}

// Complete site configuration
export interface SiteConfig {
  id: string;
  guestCap: number;
  burst: BurstConfig;
  tree: TreeConfig;
  theme: ThemeConfig;
  seasonal: SeasonalConfig;
  rewards: RewardsConfig;
  runes: RunesConfig;
  updatedAt: Date;
  updatedBy?: string;
}

// Order line item with UPC for rune mapping
export interface OrderLineItem {
  id: string;
  name: string;
  quantity: number;
  unitAmount: number;
  upc?: string;
  printifyProductId?: string;
  printifyVariantId?: number;
}

// Petal grant result
export interface PetalGrantResult {
  granted: number;
  flags: {
    firstPurchase: boolean;
    hitSoftCap: boolean;
    hitHardCap: boolean;
    streakBonus: boolean;
  };
  burst: {
    size: 'small' | 'medium' | 'large' | 'none';
    amountGrantedNow: number;
  };
  newTotal: number;
  runes: CanonicalRuneId[];
  combos: RuneComboDef[];
}

// Default rune display values
export const DEFAULT_RUNE_DISPLAYS: Record<CanonicalRuneId, { name: string; glyph: string }> = {
  rune_a: { name: 'Rune I', glyph: '✶' },
  rune_b: { name: 'Rune II', glyph: '✧' },
  rune_c: { name: 'Rune III', glyph: '☍' },
  rune_d: { name: 'Rune IV', glyph: '⌖' },
  rune_e: { name: 'Rune V', glyph: '𐌗' },
  rune_f: { name: 'Rune VI', glyph: '❖' },
  rune_g: { name: 'Rune VII', glyph: '⁂' },
  rune_h: { name: 'Rune VIII', glyph: '※' },
  rune_i: { name: 'Rune IX', glyph: '✶' },
  rune_j: { name: 'Rune X', glyph: '✧' },
  rune_k: { name: 'Rune XI', glyph: '☍' },
  rune_l: { name: 'Rune XII', glyph: '⌖' },
  rune_m: { name: 'Rune XIII', glyph: '𐌗' },
  rune_n: { name: 'Rune XIV', glyph: '❖' },
  rune_o: { name: 'Rune XV', glyph: '⁂' },
  rune_p: { name: 'Rune XVI', glyph: '※' },
  rune_q: { name: 'Rune XVII', glyph: '✶' },
  rune_r: { name: 'Rune XVIII', glyph: '✧' },
  rune_s: { name: 'Rune XIX', glyph: '☍' },
  rune_t: { name: 'Rune XX', glyph: '⌖' },
};

// Default lore for runes without custom text
export const DEFAULT_RUNE_LORE = 'Origin withheld.';

// Burst size thresholds
export const BURST_THRESHOLDS = {
  small: 20, // Small burst for 20+ petals
  medium: 40, // Medium burst for 40+ petals
  large: 80, // Large burst for 80+ petals
} as const;
