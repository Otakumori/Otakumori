// DEPRECATED: This component is a duplicate. Use components\shop\ProductGrid.tsx instead.
import ProductCard from '@/app/components/shop/ProductCard';
import type { Product } from '@/app/lib/shop/types';

const demo: Product[] = [
  { id: 'tee-void', title: 'Void-Petal Sakura Tee', image: '/media/products/void-sakura.jpg', priceUSD: 48, petalBonus: 48, tag: 'New', inStock: true },
  { id: 'hoodie-guardian', title: 'Guardian Rune Hoodie', image: '/media/products/guardian-hoodie.jpg', priceUSD: 72, petalBonus: 90, tag: 'Limited', inStock: true },
  { id: 'poster-blossom', title: 'Blossom Overlord Poster (A2)', image: '/media/products/blossom-poster.jpg', priceUSD: 24, petalPrice: 24, tag: 'Variant', inStock: true },
];

// Transform Printify data to our Product format
function transformPrintifyProduct(printifyProduct: any): Product {
  return {
    id: printifyProduct.id,
    title: printifyProduct.title,
    image: printifyProduct.image || '/assets/images/placeholder-product.jpg',
    priceUSD: printifyProduct.price || 0,
    petalBonus: Math.floor((printifyProduct.price || 0) * 0.1), // 10% petal bonus
    tag: 'New',
    inStock: true,
  };
}

export default function ProductGrid({ products = demo }: { products?: any[] }) {
  // Transform products if they're from Printify API
  const transformedProducts = products.length > 0 && products[0]?.id && typeof products[0].id === 'string' && products[0].id.length > 10
    ? products.map(transformPrintifyProduct)
    : products;

  return (
    <section className="relative z-30 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="absolute inset-0 -z-10 rounded-[2rem] bg-black/20 backdrop-blur-sm" />
      <div className="grid gap-5 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {transformedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}