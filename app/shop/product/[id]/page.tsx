'use client';

import { useParams } from 'next/navigation';
import ProductClient from './ProductClient';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  return <ProductClient productId={productId} />;
}
