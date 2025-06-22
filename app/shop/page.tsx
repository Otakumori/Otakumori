'use client';
'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, Filter, ShoppingCart } from 'lucide-react';

// Define Product interface (assuming it's not already in types)
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
}

// Mock product data (replace with your actual data fetching logic)
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Anime Figure - Sakura',
    price: 49.99,
    image: '/assets/products/figure1.jpg',
    category: 'Figures',
    tags: ['sakura', 'figure', 'anime'],
  },
  {
    id: 2,
    name: 'Premium Manga Collection',
    price: 29.99,
    image: '/assets/products/manga1.jpg',
    category: 'Manga',
    tags: ['manga', 'collection'],
  },
  {
    id: 3,
    name: 'Anime Art Print',
    price: 19.99,
    image: '/assets/products/art1.jpg',
    category: 'Art',
    tags: ['art', 'print'],
  },
  {
    id: 4,
    name: 'Cosplay Costume - Hero',
    price: 89.99,
    image: '/assets/products/cosplay1.jpg',
    category: 'Cosplay',
    tags: ['cosplay', 'hero'],
  },
];

const categories = ['All', ...Array.from(new Set(mockProducts.map(product => product.category)))];
const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

const ShopPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const { addItem } = useCart();

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-white">Shop</h1>
          <p className="text-pink-200">Discover our collection of anime merchandise</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-pink-200" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="border-pink-500/30 bg-white/10 pl-10 text-white placeholder-pink-200"
              />
            </div>
          </div>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="border-pink-500/30 bg-white/10 text-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
            className="border-pink-500/30 bg-white/10 text-white"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(product => (
            <motion.div key={product.id} whileHover={{ y: -10 }} transition={{ duration: 0.2 }}>
              <Card className="overflow-hidden border-pink-500/30 bg-white/10 backdrop-blur-lg">
                <div className="relative h-64">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                  {product.tags.includes('New') && (
                    <div className="absolute right-2 top-2 rounded bg-pink-500 px-2 py-1 text-xs text-white">
                      New
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-sm text-pink-400">{product.category}</span>
                  <h3 className="mt-1 text-lg font-semibold text-white">{product.name}</h3>
                  <p className="mt-2 text-pink-200">${product.price}</p>
                  <Button
                    className="mt-4 w-full bg-pink-500 hover:bg-pink-600"
                    onClick={() => addItem(product)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-pink-200">No products found matching your criteria</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default ShopPage;
