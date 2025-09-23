import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StarfieldPurple from '../../components/StarfieldPurple';
// import NavBar from '../../components/NavBar'; // Removed to prevent nav overlay
import FooterDark from '../../components/FooterDark';
import ProductDetail from '../../components/shop/ProductDetail';
import { t } from '@/lib/microcopy';

export const runtime = 'nodejs';

async function getProduct(slug: string) {
  try {
    const baseUrl = 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/v1/products/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.ok ? data.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found — Otaku-mori',
    };
  }

  return {
    title: `${product.title} — Otaku-mori`,
    description: product.description || `Shop ${product.title} at Otaku-mori`,
    openGraph: {
      title: product.title,
      description: product.description || `Shop ${product.title} at Otaku-mori`,
      images: product.images?.[0]?.src ? [product.images[0].src] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return (
      <main className="min-h-screen bg-[#080611] pt-24">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-2xl font-semibold text-white">Product not found</h1>
        </div>
      </main>
    );
  }
  // Transform API response to match ProductDetail component expectations
  const transformedProduct = {
    id: product.id,
    name: product.title,
    price: product.price,
    image: product.images?.[0]?.src || '',
    slug: product.id,
    description: product.description,
    variants:
      product.variants?.slice(0, 8).map((v: any, index: number) => ({
        id: v.id,
        name: `Size ${String.fromCharCode(65 + index)}`, // A, B, C, D, E, F, G, H
        price: v.price,
        inStock: v.is_enabled,
      })) || [],
    images: product.images?.map((img: any) => img.src || img) || [],
    inStock: product.available,
    category: product.category,
  };

  return (
    <>
      <StarfieldPurple />
      {/* NavBar removed to prevent overlay */}
      <main className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <ProductDetail product={transformedProduct} />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
