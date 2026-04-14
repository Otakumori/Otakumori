import { generateSEO } from '@/app/lib/seo';
import SmartProviderProductDetailClient from '@/app/components/shop/SmartProviderProductDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return generateSEO({
    title: 'Product Options',
    description: 'Provider-backed product detail page with option-driven pricing and image behavior.',
    url: `/shop-smart-item/${id}`,
  });
}

export default async function ShopSmartItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="relative min-h-screen vignette">
      <div className="relative z-40 container mx-auto px-4 py-8">
        <SmartProviderProductDetailClient productId={id} />
      </div>
    </main>
  );
}
