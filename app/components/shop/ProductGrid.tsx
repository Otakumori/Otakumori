import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  currency: string;
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shop/products');
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-lg bg-red-100 p-4 text-red-700">
          <p className="font-medium">Error loading products</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map(product => (
        <Card
          key={product.id}
          className="overflow-hidden border-pink-500/30 bg-white/10 backdrop-blur-lg transition-all hover:border-pink-500"
        >
          <div className="relative h-48 w-full">
            <Image src={product.image_url} alt={product.title} fill className="object-cover" />
          </div>
          <div className="p-4">
            <h3 className="mb-2 text-xl font-bold text-white">{product.title}</h3>
            <p className="mb-4 line-clamp-2 text-pink-200">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">
                {product.currency} {product.price.toFixed(2)}
              </span>
              <Button className="bg-pink-600 hover:bg-pink-700">Add to Cart</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
