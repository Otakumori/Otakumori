
import { headers } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { paths } from '@/lib/paths';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { HeaderButton } from '@/components/ui/header-button';
import { stripHtml } from '@/lib/html';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  image: string;
  available: boolean;
  slug?: string;
}

interface ShopData {
  products: Product[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

// Products to exclude from homepage preview (can still appear in full shop)
const HOMEPAGE_EXCLUDED_TITLES = [
  'Memory Match T-shirt',
  'Petal Samurai Hoodie',
  'Soapstone Mug',
  'Guardian Rune Pin',
  'Abyss T-Shirt',
  'Cherry Blossom Hoodie',
  'Otakumori Poster',
];

async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  
  if (host) {
    return `${protocol}://${host}`;
  }
  
  // Fallback for development
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export default async function ShopSection() {
  let shopData: ShopData = { products: [] };
  let isBlockedData = false;

  try {
    // Build exclusion query parameter
    const excludeParam = HOMEPAGE_EXCLUDED_TITLES.map((t) => `excludeTitles=${encodeURIComponent(t)}`).join('&');
    const baseUrl = await getBaseUrl();
    const apiUrl = `${baseUrl}/api/v1/products/featured?force_printify=true&limit=8&${excludeParam}`;

    // Use direct fetch instead of safeFetch for server components
    const response = await fetch(apiUrl, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      const data = result.ok ? result.data : result;
      
      const products =
        data?.products?.map((product: Product) => ({
          ...product,
          image: product.image || '/assets/placeholder-product.jpg',
          description: stripHtml(product.description || ''),
          slug: product.slug,
        })) || [];
      
      shopData = {
        products,
        pagination: data?.pagination,
      };
    } else {
      console.warn('ShopSection: API returned', response.status);
      shopData = { products: [] };
    }
  } catch (error) {
    console.warn('ShopSection: featured API failed during SSR:', error);
    shopData = { products: [] };
    isBlockedData = true;
  }

  const { products } = shopData;
  const hasProducts = !isBlockedData && products.length > 0;

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
            <HeaderButton href={paths.shop()}>Explore Shop</HeaderButton>
          </div>
        </div>
      ) : hasProducts ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={product.slug ? paths.product(product.slug) : paths.shop()}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <GlassCard className="flex h-full flex-col">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image || '/assets/placeholder-product.jpg'}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
                  <span className="absolute left-4 top-4 rounded-full bg-pink-500/20 px-3 py-1 text-xs font-medium text-pink-200 backdrop-blur">
                    {product.available ? 'Featured' : 'Coming Soon'}
                  </span>
                </div>
                <GlassCardContent className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-white transition-colors group-hover:text-pink-400">
                    {product.title}
                  </h3>
                  {product.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-white/70">{product.description}</p>
                  )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-pink-300">
                      ${product.price.toFixed(2)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        product.available
                          ? 'bg-emerald-500/15 text-emerald-200'
                          : 'bg-amber-500/15 text-amber-200'
                      }`}
                    >
                      {product.available ? 'In Stock' : 'Notify Me'}
                    </span>
                  </div>
                </GlassCardContent>
              </GlassCard>
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
            <HeaderButton href={paths.shop()}>Explore Shop</HeaderButton>
          </div>
        </div>
      )}

      {hasProducts && (
        <div className="text-center mt-8">
          <HeaderButton href={paths.shop()}>View All Products</HeaderButton>
        </div>
      )}
    </div>
  );
}
