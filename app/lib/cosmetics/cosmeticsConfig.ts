/**
 * Cosmetics Configuration
 * Defines unlockable cosmetic items (HUD skins, overlays, etc.)
 * Purchasable via petal shop
 */

export type HudSkinId = 'default' | 'quake';

export type CosmeticType = 'hud-skin';

export interface CosmeticItem {
  id: string;
  type: CosmeticType;
  hudSkinId?: HudSkinId;
  name: string;
  description: string;
  costPetals: number;
  previewUrl?: string;
}

/**
 * Available cosmetic items in the petal shop
 */
export const cosmeticItems: CosmeticItem[] = [
  {
    id: 'hud-quake-overlay',
    type: 'hud-skin',
    hudSkinId: 'quake',
    name: 'Quake-Style HUD Overlay',
    description: 'Unlock a crunchy, metal HUD style inspired by old-school arena shooters. Perfect for retro gaming vibes.',
    costPetals: 500,
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

