'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Star,
  Users,
  ShoppingBag,
  Heart,
  Search,
  Sparkles,
  Gamepad2,
} from 'lucide-react';
import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

import { CherryTree } from '@/components/hero/CherryTree';
import { Ps1Petals } from '@/components/hero/Ps1Petals';
import { PetalHUD } from '@/components/hero/PetalHUD';
import { PetalSystem } from '@/components/PetalSystem';
import { SoapstoneFooter } from '@/components/SoapstoneFooter';
import FeaturedCarousel from '@/components/FeaturedCarousel';

// Client component for interactive elements
function HomePageClient({ userId, siteConfig }: { userId: string | null; siteConfig: any }) {
  const [petalCount, setPetalCount] = useState(0);
  const [guestPetalCount, setGuestPetalCount] = useState(0);
  const [isGuest, setIsGuest] = useState(!userId);

  // Handle petal collection
  const handlePetalCollected = useCallback(async (petalId: string) => {
    try {
      const response = await fetch('/api/petals/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.ok) {
        if (result.data.isGuest) {
          setGuestPetalCount(result.data.currentGuestPetals);
          setIsGuest(true);
        } else {
          setPetalCount(result.data.newBalance);
          setIsGuest(false);
        }
      }
    } catch (error) {
      console.error('Failed to collect petal:', error);
    }
  }, []);

  // Handle sign-in click
  const handleSignInClick = () => {
    // Clerk will handle the sign-in flow
    window.location.href = '/sign-in';
  };

  // Merge guest petals on sign-in
  useEffect(() => {
    if (userId && isGuest && guestPetalCount > 0) {
      fetch('/api/petals/merge', { method: 'POST' })
        .then(response => response.json())
        .then(result => {
          if (result.ok) {
            setPetalCount(result.data.newBalance);
            setGuestPetalCount(0);
            setIsGuest(false);
          }
        })
        .catch(console.error);
    }
  }, [userId, isGuest, guestPetalCount]);

  return (
    <>
      {/* Petal HUD */}
      <PetalHUD
        petalCount={petalCount}
        guestPetalCount={guestPetalCount}
        guestCap={siteConfig.guestCap}
        isGuest={isGuest}
        onSignInClick={handleSignInClick}
      />

      {/* Cherry Tree Overlay */}
      <CherryTree
        swayIntensity={siteConfig.tree?.sway || 0.5}
        onPetalSpawn={(x, y) => {
          // This will be handled by the petal system
        }}
        className="z-10"
      />

      {/* PS1-Style Petals */}
      <Ps1Petals
        maxPetals={25}
        spawnRate={siteConfig.tree?.spawnRate || 2000}
        snapPixels={siteConfig.tree?.snapPx || 4}
        ditherOpacity={siteConfig.tree?.dither || 0.3}
        onPetalCollected={handlePetalCollected}
        className="z-20"
      />

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950" />

        {/* Hero Content */}
        <div className="relative z-30 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
              <span className="text-pink-400">Otakumori</span>
            </h1>

            <p className="mx-auto mb-8 max-w-3xl text-xl text-neutral-300 md:text-2xl">
              Small-batch anime-inspired apparel, accessories & home decor.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mb-8 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="What're ya buyin?"
                  className="w-full rounded-lg border border-pink-500/30 bg-white/10 py-3 pl-10 pr-4 text-white placeholder-gray-300 backdrop-blur-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Hero Stats */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-pink-400">
                  {isGuest ? guestPetalCount : petalCount}
                </div>
                <div className="text-sm text-neutral-400">
                  {isGuest ? 'Guest Petals' : 'Petals Collected'}
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-purple-400">
                  <Sparkles className="mx-auto h-8 w-8" />
                </div>
                <div className="text-sm text-neutral-400">Magical Items</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-blue-400">
                  <Users className="mx-auto h-8 w-8" />
                </div>
                <div className="text-sm text-neutral-400">Community</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/shop"
                className="group flex items-center rounded-lg bg-pink-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-pink-700"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/mini-games"
                className="group flex items-center rounded-lg border-2 border-pink-500/50 bg-transparent px-8 py-4 font-semibold text-pink-400 transition-colors hover:border-pink-400 hover:text-pink-300"
              >
                <Gamepad2 className="mr-2 h-5 w-5" />
                Mini-Games
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              {userId ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-pink-200">Welcome back!</span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="rounded-lg bg-pink-500 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-600">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-lg border border-pink-400 bg-transparent px-6 py-3 font-medium text-pink-400 transition-colors hover:bg-pink-400/10">
                      Sign Up
                    </button>
                  </SignUpButton>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="bg-neutral-900 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-white">Featured Collection</h2>
            <p className="mx-auto max-w-2xl text-xl text-neutral-300">
              Discover our latest anime-inspired creations, carefully crafted for the true otaku.
            </p>
          </motion.div>

          <FeaturedCarousel />
        </div>
      </section>

      {/* About Section */}
      <section className="bg-neutral-950 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid items-center gap-12 md:grid-cols-2"
          >
            <div>
              <h2 className="mb-6 text-4xl font-bold text-white">
                Crafted with <span className="text-pink-400">Passion</span>
              </h2>
              <p className="mb-6 text-lg text-neutral-300">
                Every piece in our collection is designed with the anime community in mind. From
                subtle references to bold statements, we celebrate the art and culture that brings
                us together.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Star className="mr-3 h-5 w-5 text-pink-400" />
                  <span className="text-neutral-300">Premium quality materials</span>
                </div>
                <div className="flex items-center">
                  <Heart className="mr-3 h-5 w-5 text-pink-400" />
                  <span className="text-neutral-300">Community-driven designs</span>
                </div>
                <div className="flex items-center">
                  <ShoppingBag className="mr-3 h-5 w-5 text-pink-400" />
                  <span className="text-neutral-300">Worldwide shipping</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex h-96 w-full items-center justify-center rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <div className="text-center">
                  <div className="mb-4 text-6xl">🌸</div>
                  <p className="font-medium text-pink-300">Your Collection Awaits</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Soapstone Footer */}
      <SoapstoneFooter />
    </>
  );
}

// Main page component
export default function HomePage() {
  return (
    <HomePageClient
      userId={null}
      siteConfig={{ guestCap: 50, tree: { sway: 0.5, spawnRate: 2000, snapPx: 4, dither: 0.3 } }}
    />
  );
}

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';
