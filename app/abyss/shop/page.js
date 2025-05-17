'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AbyssShop() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAccess = async () => {
      if (status === 'authenticated' && session?.user) {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('abyss_verified')
          .eq('user_id', session.user.id)
          .single();

        if (!preferences?.abyss_verified) {
          router.push('/abyss');
          return;
        }
      } else {
        router.push('/auth/signin');
        return;
      }
    };

    checkAccess();
  }, [status, session, router, supabase]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('abyss_products')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-16 w-16 rounded-full border-4 border-pink-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-4xl font-bold text-pink-500"
        >
          Abyss Shop
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {products.map(product => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.02 }}
              className="overflow-hidden rounded-lg bg-gray-900 shadow-xl"
            >
              <div className="relative aspect-square">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {product.is_new && (
                  <div className="absolute right-2 top-2 rounded-full bg-pink-500 px-2 py-1 text-sm text-white">
                    New
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="mb-2 text-xl font-bold text-pink-500">{product.name}</h3>
                <p className="mb-4 line-clamp-2 text-gray-400">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">${product.price}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded bg-pink-600 px-4 py-2 font-bold text-white hover:bg-pink-700"
                  >
                    Add to Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
