'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AbyssShop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch R18 products from Printify API
    const fetchProducts = async () => {
      try {
        // TODO: Implement Printify API integration for R18 products
        // For now, using mock data
        setProducts([
          {
            id: 1,
            name: 'Exclusive R18 Poster',
            price: 29.99,
            image: '/abyss/products/poster1.jpg',
            description: 'Limited edition R18 artwork poster'
          },
          {
            id: 2,
            name: 'Collector\'s Pin Set',
            price: 19.99,
            image: '/abyss/products/pins1.jpg',
            description: 'Set of 5 exclusive R18 enamel pins'
          },
          // Add more products as needed
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-pink-500 mb-8">Abyss Shop</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-xl"
          >
            <div className="relative h-64">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-pink-500 mb-2">{product.name}</h2>
              <p className="text-gray-400 mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-white">${product.price}</span>
                <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg">
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Age Verification Notice */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-sm">
          All products in the Abyss Shop are intended for adults only. By purchasing, you confirm that you are 18 or older.
        </p>
      </div>
    </div>
  );
} 