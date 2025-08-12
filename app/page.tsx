'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Users, ShoppingBag, Heart, Search, Sparkles } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import { TestSupabaseButton } from '@/components/TestSupabaseButton';
import { PetalSystem } from '@/components/PetalSystem';
import { SoapstoneFooter } from '@/components/SoapstoneFooter';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';

export default function HomePage() {
  const [petalsCollected, setPetalsCollected] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Handle tab visibility for performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950" />
        
        {/* Petal System Overlay */}
        {isVisible && (
          <PetalSystem 
            onPetalCollected={(count) => setPetalsCollected(prev => prev + count)}
            petalsCollected={petalsCollected}
          />
        )}

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="text-pink-400">Otakumori</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-300 mb-8 max-w-3xl mx-auto">
              Small-batch anime-inspired apparel, accessories & home decor.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="What're ya buyin?"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-pink-500/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400 mb-2">
                  {petalsCollected}
                </div>
                <div className="text-sm text-neutral-400">Petals Collected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  <Sparkles className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-sm text-neutral-400">Magical Items</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  <Users className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-sm text-neutral-400">Community</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button className="px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors flex items-center group">
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="px-8 py-4 bg-transparent border-2 border-pink-500/50 hover:border-pink-400 text-pink-400 hover:text-pink-300 font-semibold rounded-lg transition-colors">
                View Gallery
              </button>
            </div>

            {/* Fallback Links */}
            <div className="mt-6 text-xs text-pink-200/60">
              <span>Having trouble? </span>
              <a
                href="https://accounts.otaku-mori.com/sign-in"
                className="underline hover:text-pink-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sign in
              </a>
              <span> or </span>
              <a
                href="https://accounts.otaku-mori.com/sign-up"
                className="underline hover:text-pink-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sign up
              </a>
              <span> via Account Portal</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Featured Collection
            </h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              Discover our latest anime-inspired creations, carefully crafted for the true otaku.
            </p>
          </motion.div>
          
          <FeaturedCarousel />
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Crafted with <span className="text-pink-400">Passion</span>
              </h2>
              <p className="text-lg text-neutral-300 mb-6">
                Every piece in our collection is designed with the anime community in mind. 
                From subtle references to bold statements, we celebrate the art and culture 
                that brings us together.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-pink-400 mr-3" />
                  <span className="text-neutral-300">Premium quality materials</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-5 w-5 text-pink-400 mr-3" />
                  <span className="text-neutral-300">Community-driven designs</span>
                </div>
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 text-pink-400 mr-3" />
                  <span className="text-neutral-300">Worldwide shipping</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl border border-pink-500/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌸</div>
                  <p className="text-pink-300 font-medium">Your Collection Awaits</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Soapstone Footer */}
      <SoapstoneFooter />

      {/* Development Test Button */}
      <TestSupabaseButton />
    </>
  );
}