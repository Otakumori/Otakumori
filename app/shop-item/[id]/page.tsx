import { generateSEO } from '@/app/lib/seo';
import ProviderProductDetailClient from '@/app/components/shop/ProviderProductDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return generateSEO({
    title: 'Product',
    description: 'Provider-backed product detail page.',
    url: `/shop-item/${id}`,
  });
}

export default async function ShopItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="relative min-h-screen vignette">
      <div className="relative z-40 container mx-auto px-4 py-8">
        <ProviderProductDetailClient productId={id} />
      </div>
    </main>
  );
}
