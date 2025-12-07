import { generateSEO } from '@/app/lib/seo';
import ProductPageClient from './ProductPageClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return generateSEO({
    title: 'Shop',
    description: 'Browse our anime and gaming merchandise',
    url: `/shop/product/${id}`,
  });
}

export default function ProductDetailPage() {
  return <ProductPageClient />;
}
