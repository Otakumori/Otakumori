// DEPRECATED: This component is a duplicate. Use app\types.ts instead.
export type Product = {
  id: string;
  title: string;
  image: string;
  priceUSD: number;
  petalPrice?: number;
  petalBonus?: number;
  tag?: 'New' | 'Limited' | 'Restock' | 'Variant';
  inStock?: boolean;
};
export const PETAL_TO_USD = 1;
