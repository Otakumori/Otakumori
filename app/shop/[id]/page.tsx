'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  tags: string[];
  variants: {
    id: string;
    name: string;
    price: number;
  }[];
}

// Mock product data (replace with API call)
const product: Product = {
  id: '1',
  name: 'Limited Edition Anime Figure',
  price: 89.99,
  description: 'A stunning limited edition anime figure crafted with meticulous attention to detail. This premium collectible features dynamic pose, intricate design elements, and high-quality materials.',
  images: [
    '/images/products/figure1.jpg',
    '/images/products/figure1-2.jpg',
    '/images/products/figure1-3.jpg',
  ],
  category: 'Figures',
  tags: ['Limited Edition', 'Popular', 'New'],
  variants: [
    { id: '1', name: 'Standard', price: 89.99 },
    { id: '2', name: 'Deluxe Edition', price: 129.99 },
  ],
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: selectedVariant.price,
      image: product.images[0],
      quantity: 1,
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-[500px] rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-24 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-pink-500' : ''
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - View ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-pink-400 text-sm">{product.category}</span>
              <h1 className="text-4xl font-bold text-white mt-2">{product.name}</h1>
              <p className="text-2xl text-pink-200 mt-4">${selectedVariant.price}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Description</h2>
              <p className="text-pink-200">{product.description}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Variants</h2>
              <div className="flex gap-4">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedVariant.id === variant.id
                        ? 'border-pink-500 bg-pink-500/20 text-white'
                        : 'border-pink-500/30 text-pink-200 hover:bg-pink-500/10'
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-pink-500 hover:bg-pink-600"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-pink-500/30 text-pink-200 hover:bg-pink-500/10"
              >
                <Heart className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-pink-500/30 text-pink-200 hover:bg-pink-500/10"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="pt-6 border-t border-pink-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">Product Details</h2>
              <ul className="space-y-2 text-pink-200">
                <li>• Premium quality materials</li>
                <li>• Limited edition release</li>
                <li>• Includes display stand</li>
                <li>• Certificate of authenticity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 