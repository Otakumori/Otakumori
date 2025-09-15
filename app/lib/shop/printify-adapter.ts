import type { Product } from './types';

type PrintifyItem = {
  id: string;
  title: string;
  images: string[];
  price: number;
  tags?: string[];
  available?: boolean;
};
export function mapPrintify(items: PrintifyItem[]): Product[] {
  return items.map((i) => ({
    id: i.id,
    title: i.title,
    image: i.images?.[0] ?? '/media/products/fallback.jpg',
    priceUSD: (i.price ?? 0) / 100, // if cents
    petalBonus: Math.round(((i.price ?? 0) / 100) * 0.1),
    tag: i.tags?.includes('limited') ? 'Limited' : i.tags?.includes('variant') ? 'Variant' : 'New',
    inStock: i.available ?? true,
  }));
}
