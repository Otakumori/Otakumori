import { generateSEO } from '@/app/lib/seo';
import ProofProviderProductDetailClient from '@/app/components/shop/ProofProviderProductDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return generateSEO({
    title: 'Product Proof',
    description: 'Minimal provider-backed product detail test page.',
    url: `/shop-proof-item/${id}`,
  });
}

export default async function ShopProofItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="relative min-h-screen vignette">
      <div className="relative z-40 container mx-auto px-4 py-8">
        <ProofProviderProductDetailClient productId={id} />
      </div>
    </main>
  );
}
