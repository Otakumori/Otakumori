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

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/products/${productId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }
        const json = await response.json();
        const p = json?.data;
        if (!p) {
          setError('Product not found');
          return;
        }
        const shaped: Product = {
          id: p.id,
          title: p.title,
          description: p.description,
          image_url: p.images?.[0],
          price: p.price,
          currency: 'USD',
          variants: (p.variants ?? []).map((v: any) => ({
            id: v.id,
            title: String(v.printifyVariantId ?? 'Variant'),
            price: (v.priceCents ?? 0) / 100,
            is_enabled: v.isEnabled,
            is_default: false,
            sku: String(v.printifyVariantId ?? v.id),
          })),
        };
        setProduct(shaped);
        if (shaped.variants && shaped.variants.length > 0) {
          setSelectedVariant(shaped.variants[0] ?? null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An error occurred while fetching the product',
        );
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
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
