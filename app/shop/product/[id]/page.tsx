'use client';

import { generateSEO } from '@/app/lib/seo';
import { useParams } from 'next/navigation';
import ProductClient from './ProductClient';
import ClientErrorBoundary from '@/app/components/util/ClientErrorBoundary';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return generateSEO({
    title: 'Shop',
    description: 'Browse our anime and gaming merchandise',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\shop\product\:id\page.tsx',
  });
}
export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <ClientErrorBoundary>
      <ProductClient productId={productId} />
    </ClientErrorBoundary>
  );
}
