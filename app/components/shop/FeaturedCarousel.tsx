'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PrintifyProduct } from '@/app/lib/printify/service';

interface FeaturedCarouselProps {
  products: PrintifyProduct[];
  autoplay?: boolean;
  interval?: number;
}

export function FeaturedCarousel({
  products,
  autoplay = true,
  interval = 5000,
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((current) => (current + 1) % products.length);
  }, [products.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((current) => (current - 1 + products.length) % products.length);
  }, [products.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || isHovering || products.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, isHovering, nextSlide, products.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerEnter = () => setIsHovering(true);
    const handlePointerLeave = () => setIsHovering(false);
    const handleFocusIn = () => setIsHovering(true);
    const handleFocusOut = (event: FocusEvent) => {
      if (container && !container.contains(event.relatedTarget as Node)) {
        setIsHovering(false);
      }
    };

    container.addEventListener('pointerenter', handlePointerEnter);
    container.addEventListener('pointerleave', handlePointerLeave);
    container.addEventListener('focusin', handleFocusIn);
    container.addEventListener('focusout', handleFocusOut);

    return () => {
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.removeEventListener('focusin', handleFocusIn);
      container.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  if (products.length === 0) {
    return null;
  }

  const currentProduct = products[currentIndex];
  const displayImage = currentProduct.images[0];

  // Calculate price range
  const prices = currentProduct.variants.map((v) => v.price).filter((p) => p > 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceDisplay =
    minPrice === maxPrice
      ? `$${(minPrice / 100).toFixed(2)}`
      : `From $${(minPrice / 100).toFixed(2)}`;

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-2xl">
      {/* Main Carousel Container */}
      <div className="relative aspect-[21/9] md:aspect-[21/7] bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg border border-white/20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          {displayImage && (
            <Image
              src={displayImage.src}
              alt={currentProduct.title}
              fill
              className="object-cover opacity-40"
              sizes="100vw"
              priority={currentIndex === 0}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative h-full container mx-auto px-6 md:px-12 flex items-center">
          <div className="max-w-2xl space-y-4 md:space-y-6">
            {/* Badge */}
            <div className="flex items-center gap-3">
              <span className="bg-pink-500/90 text-white text-xs md:text-sm font-bold px-4 py-1.5 rounded-full">
                FEATURED
              </span>
              {currentProduct.is_printify_express_eligible && (
                <span className="bg-green-500/90 text-white text-xs md:text-sm font-bold px-4 py-1.5 rounded-full">
                  EXPRESS SHIPPING
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {currentProduct.title}
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg text-zinc-200 line-clamp-2 max-w-xl">
              {currentProduct.description || 'Premium quality print-on-demand merchandise'}
            </p>

            {/* Price and CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-2xl md:text-4xl font-bold text-pink-400">{priceDisplay}</div>
              <Link
                href={`/shop/product/${currentProduct.id}`}
                className="group bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-pink-500/50 flex items-center gap-2"
              >
                Shop Now
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Product Highlights */}
            {currentProduct.tags && currentProduct.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentProduct.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-lg border border-white/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {products.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500"
              aria-label="Previous product"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500"
              aria-label="Next product"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {products.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  index === currentIndex
                    ? 'bg-pink-500 w-8 h-2'
                    : 'bg-white/40 hover:bg-white/60 w-2 h-2'
                }`}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Counter */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full">
        {currentIndex + 1} / {products.length}
      </div>
    </div>
  );
}
