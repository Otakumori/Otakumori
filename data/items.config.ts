 
 
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface ShopItem {
  sku: string;
  name: string;
  kind: 'COSMETIC' | 'OVERLAY' | 'BADGE';
  rarity: Rarity;
  priceRunes?: number;
  pricePetals?: number;
}

export const rotationWeekly: ShopItem[] = [
  {
    sku: 'frame.pink.v1',
    name: 'Sakura Frame V1',
    kind: 'COSMETIC',
    rarity: 'Common',
    priceRunes: 1,
  },
  {
    sku: 'overlay.arcade.neon',
    name: 'Arcade Neon Overlay',
    kind: 'OVERLAY',
    rarity: 'Rare',
    priceRunes: 3,
  },
  {
    sku: 'badge.hanami.v1',
    name: 'Hanami Badge',
    kind: 'BADGE',
    rarity: 'Common',
    pricePetals: 250,
  },
];
