'use client';
import { logger } from '@/app/lib/logger';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { fetchProducts } from '../utils/printifyAPI';

// const CATEGORY_MAP = {
//   Women: 'Apparel',
//   Men: 'Apparel',
//   Accessories: 'Accessories',
//   'Home & Living': 'Home Decor',
//   // Add more mappings as needed
// };

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'apparel', name: 'Apparel' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'figures', name: 'Figures' },
  { id: 'home', name: 'Home Decor' },
];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  // const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shop/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        setError(err.message);
        logger.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((product) => product.category === selectedCategory);

  if (error) {
    return (
      <div className="mt-8 rounded-lg bg-gray-900/80 p-4 text-center text-lg font-bold text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-center text-4xl font-bold text-white">
        {
          <>
            <span role="img" aria-label="emoji">
              S
            </span>
            <span role="img" aria-label="emoji">
              h
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              p
            </span>
            ' '
            <span role="img" aria-label="emoji">
              O
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              k
            </span>
            <span role="img" aria-label="emoji">
              u
            </span>
            <span role="img" aria-label="emoji">
              m
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
          </>
        }
      </h1>
      {/* Category Navigation */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              selectedCategory === category.id
                ? 'bg-pink-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="mt-8 text-center text-white">
          {
            <>
              <span role="img" aria-label="emoji">
                L
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                a
              </span>
              <span role="img" aria-label="emoji">
                d
              </span>
              <span role="img" aria-label="emoji">
                i
              </span>
              <span role="img" aria-label="emoji">
                n
              </span>
              <span role="img" aria-label="emoji">
                g
              </span>
              ' '
              <span role="img" aria-label="emoji">
                p
              </span>
              <span role="img" aria-label="emoji">
                r
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                d
              </span>
              <span role="img" aria-label="emoji">
                u
              </span>
              <span role="img" aria-label="emoji">
                c
              </span>
              <span role="img" aria-label="emoji">
                t
              </span>
              <span role="img" aria-label="emoji">
                s
              </span>
              ...
            </>
          }
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-lg bg-gray-800 transition hover:shadow-lg"
            >
              <Link href={`/shop/product/${product.id}`}>
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h2 className="mt-2 text-xl font-bold text-white">{product.title}</h2>
                  <p className="mt-2 text-lg font-semibold text-pink-400">${product.price}</p>
                  <button className="mt-3 w-full rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white transition hover:bg-pink-700">
                    {
                      <>
                        ''
                        <span role="img" aria-label="emoji">
                          V
                        </span>
                        <span role="img" aria-label="emoji">
                          i
                        </span>
                        <span role="img" aria-label="emoji">
                          e
                        </span>
                        <span role="img" aria-label="emoji">
                          w
                        </span>
                        ' '
                        <span role="img" aria-label="emoji">
                          D
                        </span>
                        <span role="img" aria-label="emoji">
                          e
                        </span>
                        <span role="img" aria-label="emoji">
                          t
                        </span>
                        <span role="img" aria-label="emoji">
                          a
                        </span>
                        <span role="img" aria-label="emoji">
                          i
                        </span>
                        <span role="img" aria-label="emoji">
                          l
                        </span>
                        <span role="img" aria-label="emoji">
                          s
                        </span>
                        ''
                      </>
                    }
                  </button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
