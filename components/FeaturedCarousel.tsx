'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, ShoppingBag } from 'lucide-react';

interface FeaturedProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  images: string[];
  category?: string;
  tags: string[];
}

export default function FeaturedCarousel() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/v1/shop/products?limit=6');
      const data = await response.json();
      
      if (data.ok && data.data) {
        setProducts(data.data.products);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(products.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? Math.ceil(products.length / 3) - 1 : prev - 1
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌸</div>
        <h3 className="text-xl font-semibold text-white mb-2">Featured Collection</h3>
        <p className="text-neutral-400">Coming soon...</p>
      </div>
    );
  }

  const slides = [];
  for (let i = 0; i < products.length; i += 3) {
    slides.push(products.slice(i, i + 3));
  }

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                {slide.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden hover:border-pink-500/50 transition-all duration-200 hover:scale-105"
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-neutral-800 relative overflow-hidden">
                      <img
                        src={product.images[0] || '/images/products/placeholder.svg'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      
                      {/* Quick Actions */}
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Link
                          href={`/shop/product/${product.id}`}
                          className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          View Details
                        </Link>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-pink-400 transition-colors">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-neutral-400">4.8</span>
                        </div>
                      </div>
                      
                      {product.category && (
                        <span className="inline-block px-2 py-1 bg-pink-600/20 text-pink-400 text-xs rounded-full mb-2">
                          {product.category}
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-pink-400">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      {/* Tags */}
                      {product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-neutral-800 text-xs text-neutral-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-pink-500 w-8'
                  : 'bg-neutral-600 hover:bg-neutral-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* View All Button */}
      <div className="text-center mt-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors"
        >
          View All Products
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
