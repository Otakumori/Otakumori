import { type Metadata } from 'next';
import { generateSEO } from '@/app/lib/seo';
import ProductClient from './ProductClient';
import { env } from '@/app/env';

interface PageProps {
  params: { id: string };
}

async function getProductData(productId: string) {
  try {
    const baseUrl = env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/v1/printify/products?productId=${productId}`, {
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const result = await response.json();
    const data = result.data || result;
    return data.products?.[0] || null;
  } catch (err) {
    console.error('Failed to fetch product for metadata:', err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProductData(params.id);

  if (!product) {
    return {
      title: 'Product Not Found | Otaku-mori',
      description: 'This product could not be found.',
    };
  }

  const prices = product.variants.map((v: any) => v.price).filter((p: number) => p > 0);
  const minPrice = Math.min(...prices);
  const imageUrl = product.images?.[0]?.src || '/assets/images/og-default.png';

  return generateSEO({
    title: product.title,
    description: product.description || `Get ${product.title} at Otaku-mori`,
    image: imageUrl,
    url: `/shop/product/${params.id}`,
    type: 'product',
    price: minPrice,
    currency: 'USD',
  });
}

export default function ProductPage({ params }: PageProps) {
  return <ProductClient productId={params.id} />;
}
