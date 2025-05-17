'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchProducts } from '../utils/printifyAPI';

const CATEGORY_MAP = {
  Women: 'Apparel',
  Men: 'Apparel',
  Accessories: 'Accessories',
  'Home & Living': 'Home Decor',
  // Add more mappings as needed
};

export default function Shop() {
  const [categories, setCategories] = useState(['All']);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchProducts();
        // Map Printify products to local format
        const mappedProducts = (data.data || []).map(product => {
          // Use first tag or type as category, fallback to "Other"
          const printifyCategory = product.tags?.[0] || product.type || 'Other';
          const category = CATEGORY_MAP[printifyCategory] || printifyCategory;
          return {
            id: product.id,
            title: product.title,
            description: product.description,
            image_url: product.images?.[0]?.src
              ? [product.images[0].src]
              : ['/assets/placeholder.png'],
            price: product.variants?.[0]?.price
              ? (product.variants[0].price / 100).toFixed(2)
              : '-',
            category,
          };
        });
        setProducts(mappedProducts);
        // Collect unique categories
        const uniqueCategories = Array.from(new Set(mappedProducts.map(p => p.category)));
        setCategories(['All', ...uniqueCategories]);
      } catch (err) {
        setError(
          'Failed to load products. Please check your Printify API key and Shop ID, or try again later.'
        );
        // Log error for debugging
        // eslint-disable-next-line no-console
        console.error('Printify API error:', err);
      }
    }
    fetchData();
  }, []);

  return (
    <section className="container mx-auto p-6">
      <h1 className="text-center text-4xl font-bold text-white">Shop Otakumori</h1>

      {/* Category Filters */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-4 py-2 transition-all ${
              selectedCategory === cat ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-8 rounded-lg bg-gray-900/80 p-4 text-center text-lg font-bold text-red-400">
          {error}
        </div>
      )}

      {/* Products Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products
          .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
          .map(product => (
            <div
              key={product.id}
              className="rounded-lg bg-gray-900 p-4 shadow-lg transition hover:shadow-pink-500/30"
            >
              <Image
                src={product.image_url[0]}
                alt={product.title}
                width={300}
                height={300}
                className="rounded-lg object-cover"
              />
              <h2 className="mt-2 text-xl font-bold text-white">{product.title}</h2>
              <p className="mt-1 line-clamp-2 min-h-[2.5em] text-gray-400">{product.description}</p>
              <p className="mt-2 text-lg font-semibold text-pink-400">${product.price}</p>
              {/* View Details button, but no broken category links */}
              <button
                className="mt-3 w-full rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white transition hover:bg-pink-700"
                disabled
              >
                View Details
              </button>
            </div>
          ))}
      </div>
    </section>
  );
}
