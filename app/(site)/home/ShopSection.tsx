import { safeFetch, isSuccess, isBlocked } from '@/lib/safeFetch';
import Link from 'next/link';
import Image from 'next/image';
import { paths } from '@/lib/paths';
import GlassButton from '@/app/components/ui/GlassButton';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  image: string;
  available: boolean;
}

interface ShopData {
  products: Product[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

export default async function ShopSection() {
  let products: Product[] = [];
  let isBlockedData = false;

  try {
    // Try featured products API first, then fallback
    const featuredResult = await safeFetch<ShopData>('/api/v1/products/featured', {
      allowLive: true,
    });

    const fallbackResult = await safeFetch<{ products: Product[] }>('/api/products?limit=12', {
      allowLive: true,
    });

    const data = isSuccess(featuredResult)
      ? featuredResult.data
      : isSuccess(fallbackResult)
        ? fallbackResult.data
        : null;

    products = data?.products || [];
    isBlockedData = isBlocked(featuredResult) && isBlocked(fallbackResult);
  } catch (error) {
    // Fallback to empty products if API calls fail during SSR
    console.warn('ShopSection: API calls failed during SSR:', error);
    products = [];
    isBlockedData = true;
  }

  return (
    <div className="rounded-2xl p-8">
      <header className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#835D75' }}>
          Shop
        </h2>
        <p className="mt-2" style={{ color: '#835D75', opacity: 0.7 }}>
          Discover unique anime-inspired merchandise
        </p>
      </header>

      {isBlockedData ? (
        <div className="text-center py-12">
          <div className="p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Shop Coming Soon</h3>
            <p className="text-gray-300 mb-6">
              We're preparing something special for you. Check back soon!
            </p>
            <GlassButton href={paths.shop()} size="lg" variant="primary">
              Explore Shop
            </GlassButton>
          </div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 6).map((product) => (
            <Link key={product.id} href={paths.product(product.id)} className="group block">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(255,160,200,0.18)]">
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={product.image || '/assets/placeholder-product.jpg'}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white group-hover:text-pink-400 transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                  {product.description && (
                    <p className="text-gray-300 text-sm mt-1 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-pink-400">
                      ${product.price.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.available
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {product.available ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">No Products Available</h3>
            <p className="text-gray-300 mb-6">
              We're working on adding new products. Check back soon!
            </p>
            <GlassButton href={paths.shop()} size="lg" variant="primary">
              Explore Shop
            </GlassButton>
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div className="text-center mt-8">
          <GlassButton href={paths.shop()} size="md" variant="secondary">
            View All Products
          </GlassButton>
        </div>
      )}
    </div>
  );
}
