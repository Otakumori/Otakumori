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
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/v1/products/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found — Otaku-mori',
    };
  }

  return {
    title: `${product.name} — Otaku-mori`,
    description: product.description || `Shop ${product.name} at Otaku-mori`,
    openGraph: {
      title: product.name,
      description: product.description || `Shop ${product.name} at Otaku-mori`,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await loadProduct(params.slug);
  if (!product) {
    return (
      <main className="min-h-screen bg-[#080611] pt-24">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-2xl font-semibold text-white">Product not found</h1>
        </div>
      </main>
    );
  }
  return (
    <>
      <StarfieldPurple />
      {/* NavBar removed to prevent overlay */}
      <main className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <ProductDetail product={product} />
        </div>
      </main>
      <FooterDark />
    </>
  );
}

