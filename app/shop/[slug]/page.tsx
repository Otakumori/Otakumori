import { redirect } from 'next/navigation';

export const runtime = 'nodejs';

/**
 * Redirect /shop/[slug] to /shop/product/[slug] to consolidate product routes
 * This ensures all product links use the same route pattern
 */
export default async function ProductSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/shop/product/${slug}`);
}
