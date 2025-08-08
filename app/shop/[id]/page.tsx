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
  description:
    'A stunning limited edition anime figure crafted with meticulous attention to detail. This premium collectible features dynamic pose, intricate design elements, and high-quality materials.',
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
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
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
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-[500px] overflow-hidden rounded-lg">
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
                  className={`relative h-24 overflow-hidden rounded-lg ${
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
              <span className="text-sm text-pink-400">{product.category}</span>
              <h1 className="mt-2 text-4xl font-bold text-white">{product.name}</h1>
              <p className="mt-4 text-2xl text-pink-200">${selectedVariant.price}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Description</h2>
              <p className="text-pink-200">{product.description}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Variants</h2>
              <div className="flex gap-4">
                {product.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`rounded-lg border px-4 py-2 ${
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
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-pink-500/30 text-pink-200 hover:bg-pink-500/10"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-pink-500/30 text-pink-200 hover:bg-pink-500/10"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="border-t border-pink-500/30 pt-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Product Details</h2>
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
