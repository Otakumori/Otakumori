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
    tags: ['sakura', 'figure', 'anime']
  },
  {
    id: 2,
    name: 'Premium Manga Collection',
    price: 29.99,
    image: '/assets/products/manga1.jpg',
    category: 'Manga',
    tags: ['manga', 'collection']
  },
  {
    id: 3,
    name: 'Anime Art Print',
    price: 19.99,
    image: '/assets/products/art1.jpg',
    category: 'Art',
    tags: ['art', 'print']
  },
  {
    id: 4,
    name: 'Cosplay Costume - Hero',
    price: 89.99,
    image: '/assets/products/cosplay1.jpg',
    category: 'Cosplay',
    tags: ['cosplay', 'hero']
  }
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
          <h1 className="text-4xl font-bold text-white mb-4">Shop</h1>
          <p className="text-pink-200">Discover our collection of anime merchandise</p>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-200" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-pink-500/30 text-white placeholder-pink-200"
              />
            </div>
          </div>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="bg-white/10 border-pink-500/30 text-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
            className="bg-white/10 border-pink-500/30 text-white"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg border-pink-500/30 overflow-hidden">
                <div className="relative h-64">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {product.tags.includes('New') && (
                    <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                      New
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-pink-400 text-sm">{product.category}</span>
                  <h3 className="text-lg font-semibold text-white mt-1">{product.name}</h3>
                  <p className="text-pink-200 mt-2">${product.price}</p>
                  <Button
                    className="w-full mt-4 bg-pink-500 hover:bg-pink-600"
                    onClick={() => addItem(product)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-pink-200 text-lg">No products found matching your criteria</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default ShopPage; 