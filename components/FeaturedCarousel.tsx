'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react';

// Mock featured products data (replace with real API call)
const featuredProducts = [
  {
    id: 1,
    name: "Cherry Blossom Hoodie",
    category: "Apparel",
    price: 45.99,
    image: "/assets/images/products/hoodie-placeholder.jpg",
    description: "Soft, comfortable hoodie featuring delicate cherry blossom design"
  },
  {
    id: 2,
    name: "Anime Character Pin Set",
    category: "Accessories",
    price: 12.99,
    image: "/assets/images/products/pins-placeholder.jpg",
    description: "Collection of high-quality enamel pins featuring popular anime characters"
  },
  {
    id: 3,
    name: "Gaming Mouse Pad",
    category: "Home Decor",
    price: 24.99,
    image: "/assets/images/products/mousepad-placeholder.jpg",
    description: "Large gaming mouse pad with anime-inspired artwork"
  },
  {
    id: 4,
    name: "Limited Edition T-Shirt",
    category: "Apparel",
    price: 29.99,
    image: "/assets/images/products/tshirt-placeholder.jpg",
    description: "Exclusive design available only for a limited time"
  },
  {
    id: 5,
    name: "Desk Organizer",
    category: "Home Decor",
    price: 34.99,
    image: "/assets/images/products/organizer-placeholder.jpg",
    description: "Keep your workspace tidy with this stylish organizer"
  }
];

export function FeaturedCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 4000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, isHovered]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    // Pause auto-play temporarily when manually navigating
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
    // Pause auto-play temporarily when manually navigating
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // Pause auto-play temporarily when manually navigating
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-800/50 border border-pink-500/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center p-8">
              {/* Product Image */}
              <div className="relative group">
                <div className="w-full h-80 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-500/30 flex items-center justify-center overflow-hidden">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🌸</div>
                    <p className="text-pink-300 font-medium">Product Image</p>
                    <p className="text-sm text-neutral-400 mt-2">Placeholder for {featuredProducts[currentIndex].name}</p>
                  </div>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
                    <Heart className="h-5 w-5 text-pink-400" />
                  </button>
                  <button className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
                    <ShoppingCart className="h-5 w-5 text-pink-400" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 bg-pink-500/20 text-pink-400 text-sm rounded-full mb-3">
                    {featuredProducts[currentIndex].category}
                  </span>
                  <h3 className="text-3xl font-bold text-white mb-3">
                    {featuredProducts[currentIndex].name}
                  </h3>
                  <p className="text-lg text-neutral-300 leading-relaxed">
                    {featuredProducts[currentIndex].description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-pink-400">
                    ${featuredProducts[currentIndex].price}
                  </div>
                  <button className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors">
                    Add to Cart
                  </button>
                </div>

                {/* Product Features */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-pink-500/20">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🚚</div>
                    <p className="text-sm text-neutral-400">Free Shipping</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">⭐</div>
                    <p className="text-sm text-neutral-400">Premium Quality</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-neutral-800/80 hover:bg-neutral-700/80 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-pink-500/30"
        aria-label="Previous product"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-neutral-800/80 hover:bg-neutral-700/80 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-pink-500/30"
        aria-label="Next product"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {featuredProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-pink-400 scale-125'
                : 'bg-neutral-600 hover:bg-neutral-500'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play Controls */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="px-4 py-2 text-sm text-neutral-400 hover:text-pink-400 transition-colors"
        >
          {isAutoPlaying ? 'Pause' : 'Play'} Auto-play
        </button>
      </div>
    </div>
  );
}
