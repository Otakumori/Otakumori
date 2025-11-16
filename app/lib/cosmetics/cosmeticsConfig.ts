/**
 * Cosmetics Configuration
 * Defines unlockable cosmetic items (HUD skins, overlays, avatar apparel, accessories, VFX, etc.)
 * Purchasable via petal shop
 */

export type HudSkinId = 'default' | 'quake';

export type CosmeticType = 'hud-skin' | 'avatar-outfit' | 'avatar-accessory' | 'avatar-overlay' | 'avatar-vfx';

export type CosmeticRarity = 'common' | 'rare' | 'legendary';

export type ContentRating = 'sfw' | 'nsfw-soft' | 'nsfw-hard';

export interface CosmeticItem {
  id: string;
  type: CosmeticType;
  hudSkinId?: HudSkinId; // For hud-skin type
  name: string;
  description: string;
  costPetals: number;
  rarity?: CosmeticRarity;
  previewUrl?: string;
  contentRating?: ContentRating; // NSFW content rating (defaults to 'sfw')
  nsfw?: boolean; // Shorthand for contentRating !== 'sfw' (deprecated, use contentRating)
  matureVariant?: boolean; // Deprecated: use contentRating instead
  avatarSlot?: string; // For avatar cosmetics: 'outfit', 'hair', 'accessory', 'eyes', etc.
  tags?: string[]; // For filtering/searching (e.g., ['hair', 'glasses', 'aura'])
  metadata?: Record<string, unknown>; // Additional data (e.g., avatar part IDs, VFX config)
}

/**
 * Available cosmetic items in the petal shop
 * Prices follow petalTuning.ts tiers: common (300-600), rare (1200-2000), legendary (3500-5000)
 */
export const cosmeticItems: CosmeticItem[] = [
  // HUD Skins
  {
    id: 'hud-quake-overlay',
    type: 'hud-skin',
    hudSkinId: 'quake',
    name: 'Quake-Style HUD Overlay',
    description: 'Unlock a crunchy, metal HUD style inspired by old-school arena shooters. Perfect for retro gaming vibes.',
    costPetals: 500,
    rarity: 'common',
    contentRating: 'sfw',
  },
  
  // Avatar Outfits (SFW)
  {
    id: 'outfit-casual-pink',
    type: 'avatar-outfit',
    name: 'Casual Pink Outfit',
    description: 'A comfortable casual outfit in soft pink tones. Perfect for everyday adventures.',
    costPetals: 400,
    rarity: 'common',
    contentRating: 'sfw',
    avatarSlot: 'outfit',
    tags: ['casual', 'pink', 'outfit'],
  },
  {
    id: 'outfit-formal-black',
    type: 'avatar-outfit',
    name: 'Formal Black Ensemble',
    description: 'Elegant formal wear for special occasions. Stand out in style.',
    costPetals: 1500,
    rarity: 'rare',
    contentRating: 'sfw',
    avatarSlot: 'outfit',
    tags: ['formal', 'black', 'outfit'],
  },
  
  // Avatar Outfits (NSFW examples - gated)
  {
    id: 'outfit-nsfw-soft-lingerie',
    type: 'avatar-outfit',
    name: 'Lingerie Set',
    description: 'A delicate lingerie set. For mature audiences only.',
    costPetals: 2500,
    rarity: 'rare',
    contentRating: 'nsfw-soft',
    avatarSlot: 'outfit',
    tags: ['lingerie', 'nsfw'],
  },
  {
    id: 'outfit-nsfw-hard-bikini',
    type: 'avatar-outfit',
    name: 'Bikini Set',
    description: 'A revealing bikini set. Explicit content.',
    costPetals: 3500,
    rarity: 'legendary',
    contentRating: 'nsfw-hard',
    avatarSlot: 'outfit',
    tags: ['bikini', 'nsfw'],
  },
  
  // Avatar Accessories (SFW)
  {
    id: 'accessory-glasses-round',
    type: 'avatar-accessory',
    name: 'Round Glasses',
    description: 'Stylish round-frame glasses. Look smart and cute!',
    costPetals: 350,
    rarity: 'common',
    contentRating: 'sfw',
    avatarSlot: 'face',
    tags: ['glasses', 'face'],
  },
  {
    id: 'accessory-hairpin-sakura',
    type: 'avatar-accessory',
    name: 'Sakura Hairpin',
    description: 'A delicate cherry blossom hairpin. Adds a touch of spring to any look.',
    costPetals: 600,
    rarity: 'common',
    contentRating: 'sfw',
    avatarSlot: 'hair',
    tags: ['hair', 'sakura', 'spring'],
  },
  {
    id: 'accessory-earrings-gold',
    type: 'avatar-accessory',
    name: 'Gold Earrings',
    description: 'Elegant gold earrings that catch the light beautifully.',
    costPetals: 1800,
    rarity: 'rare',
    contentRating: 'sfw',
    avatarSlot: 'accessory',
    tags: ['earrings', 'gold', 'jewelry'],
  },
  
  // Avatar VFX/Overlays (SFW)
  {
    id: 'vfx-petal-aura',
    type: 'avatar-vfx',
    name: 'Petal Aura',
    description: 'A gentle aura of cherry blossom petals surrounds your avatar.',
    costPetals: 1200,
    rarity: 'rare',
    contentRating: 'sfw',
    tags: ['aura', 'petals', 'vfx'],
  },
  {
    id: 'vfx-slash-trail',
    type: 'avatar-vfx',
    name: 'Slash Trail Effect',
    description: 'Leave a trail of light when moving. Perfect for action-packed moments.',
    costPetals: 2200,
    rarity: 'rare',
    contentRating: 'sfw',
    tags: ['trail', 'movement', 'vfx'],
  },
  {
    id: 'overlay-glitch',
    type: 'avatar-overlay',
    name: 'Glitch Overlay',
    description: 'A cyberpunk-style glitch effect overlay. For the digital age.',
    costPetals: 4000,
    rarity: 'legendary',
    contentRating: 'sfw',
    tags: ['glitch', 'cyberpunk', 'overlay'],
  },
] as const;

/**
 * Get cosmetic item by ID
 */
export function getCosmeticItem(id: string): CosmeticItem | undefined {
  return cosmeticItems.find((item) => item.id === id);
}

/**
 * Get all HUD skin cosmetics
 */
export function getHudSkinCosmetics(): CosmeticItem[] {
  return cosmeticItems.filter((item) => item.type === 'hud-skin');
}

/**
 * Get cosmetics by type
 */
export function getCosmeticsByType(type: CosmeticType): CosmeticItem[] {
  return cosmeticItems.filter((item) => item.type === type);
}

/**
 * Get cosmetics by rarity
 */
export function getCosmeticsByRarity(rarity: CosmeticRarity): CosmeticItem[] {
  return cosmeticItems.filter((item) => item.rarity === rarity);
}

/**
 * Get avatar cosmetics (outfits, accessories, VFX, overlays)
 */
export function getAvatarCosmetics(): CosmeticItem[] {
  return cosmeticItems.filter((item) => 
    item.type === 'avatar-outfit' || 
    item.type === 'avatar-accessory' || 
    item.type === 'avatar-vfx' || 
    item.type === 'avatar-overlay'
  );
}

/**
 * Check if a cosmetic is NSFW
 */
export function isNSFWCosmetic(item: CosmeticItem): boolean {
  if (item.contentRating) {
    return item.contentRating !== 'sfw';
  }
  // Fallback to deprecated flags
  return item.nsfw === true || item.matureVariant === true;
}

/**
 * Filter cosmetics by NSFW policy
 */
export function filterByNSFWPolicy(
  items: CosmeticItem[],
  nsfwAllowed: boolean,
): CosmeticItem[] {
  if (nsfwAllowed) {
    return items; // Show all if NSFW allowed
  }
  return items.filter((item) => !isNSFWCosmetic(item));
}

/**
 * Get cosmetics by avatar slot
 */
export function getCosmeticsBySlot(slot: string): CosmeticItem[] {
  return cosmeticItems.filter((item) => item.avatarSlot === slot);
}

