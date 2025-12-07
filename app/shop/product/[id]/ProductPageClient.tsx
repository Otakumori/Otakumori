'use client';

import { useParams } from 'next/navigation';
import ProductClient from './ProductClient';
import ClientErrorBoundary from '@/app/components/util/ClientErrorBoundary';

export default function ProductPageClient() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <ClientErrorBoundary>
      <ProductClient productId={productId} />
    </ClientErrorBoundary>
  );
}

