import type { Metadata } from 'next';
import ProductDetail from '@/app/components/shop/ProductDetail';
import FooterDark from '@/app/components/FooterDark';
import { printifyService } from '@/app/lib/printify/service';

export const metadata: Metadata = {
  title: 'Product | Otaku-mori',
  description: 'Product details and variants.',
};

async function loadProduct(id: string) {
  // Try Printify first
  try {
    const p = await printifyService.getProduct(id);
    const images = Array.isArray((p as any).images)
      ? (p as any).images.map((img: any) => img?.src).filter(Boolean)
      : [];
    const variants = Array.isArray((p as any).variants)
      ? (p as any).variants.map((v: any) => ({
          id: String(v.id),
          name: `Variant #${v.id}`,
          price: typeof v.price === 'number' ? v.price / 100 : 0,
          inStock: !!v.in_stock && !!v.is_enabled,
        }))
      : [];
    const price = variants[0]?.price ?? 0;
    return {
      id: p.id,
      name: p.title,
      description: (p as any).description ?? '',
      image: images[0] || '/placeholder-product.jpg',
      images,
      slug: p.id,
      price,
      variants,
      inStock: variants.some((v: any) => v.inStock) || true,
      category: ((p as any).tags && (p as any).tags[0]) || undefined,
    };
  } catch {
    // Fallback: fetch from Prisma-backed endpoint
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/v1/products/${id}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('not_found');
      const json = await res.json();
      const d = json?.data;
      return {
        id: d.id,
        name: d.title,
        description: d.description || '',
        image: d.images?.[0] || '/placeholder-product.jpg',
        images: d.images || [],
        slug: d.id,
        price: d.price || 0,
        variants: (d.variants || []).map((v: any) => ({
          id: v.id,
          name: `Variant #${v.printifyVariantId ?? v.id}`,
          price: typeof v.priceCents === 'number' ? v.priceCents / 100 : 0,
          inStock: !!v.inStock,
        })),
        inStock: true,
        category: d.category || undefined,
      };
    } catch {
      return null;
    }
  }
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
      <main className="relative z-10 min-h-screen bg-[#080611] pt-24">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <ProductDetail product={product} />
        </div>
      </main>
      <FooterDark />
    </>
  );
}

