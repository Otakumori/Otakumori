/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useState } from 'react';

export function NavBar() {
  const [isShopOpen, setIsShopOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-otm-ink/95 backdrop-blur-sm border-b border-otm-pink/20 shadow-otm-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/assets/images/circlelogo.png"
                alt="Otaku-Mori Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
            </Link>
          </div>

          {/* Center - Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-200 hover:text-otm-pink transition-colors font-medium">
              Home
            </Link>
            
            {/* Shop Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsShopOpen(!isShopOpen)}
                className="text-gray-200 hover:text-otm-pink transition-colors font-medium flex items-center"
              >
                Shop
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isShopOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-otm-gray border border-otm-pink/20 rounded-md shadow-otm-glow">
                  <div className="py-1">
                    <Link href="/shop" className="block px-4 py-2 text-gray-200 hover:bg-otm-pink/10 hover:text-otm-pink">
                      All Products
                    </Link>
                    <Link href="/shop/apparel" className="block px-4 py-2 text-gray-200 hover:bg-otm-pink/10 hover:text-otm-pink">
                      Apparel
                    </Link>
                    <Link href="/shop/accessories" className="block px-4 py-2 text-gray-200 hover:bg-otm-pink/10 hover:text-otm-pink">
                      Accessories
                    </Link>
                    <Link href="/shop/home-decor" className="block px-4 py-2 text-gray-200 hover:bg-otm-pink/10 hover:text-otm-pink">
                      Home Decor
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <Link href="/mini-games" className="text-gray-200 hover:text-otm-pink transition-colors font-medium">
              Mini-Games
            </Link>
            <Link href="/blog" className="text-gray-200 hover:text-otm-pink transition-colors font-medium">
              Blog
            </Link>
            <Link href="/about" className="text-gray-200 hover:text-otm-pink transition-colors font-medium">
              About Me
            </Link>
          </div>

          {/* Right side - Search, Auth, Profile */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="What'reya buyin'?"
                className="w-64 px-4 py-2 bg-otm-gray/50 border border-otm-pink/20 rounded-full text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-otm-pink/50 focus:border-otm-pink/50"
              />
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-otm-pink"
                aria-label="Search"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Auth */}
            <SignedOut>
              <SignInButton>
                <button className="rounded-full bg-otm-pink hover:bg-otm-pink-dark px-4 py-2 text-white transition-all duration-200 shadow-otm-glow hover:shadow-otm-glow-strong">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <UserButton 
                appearance={{ 
                  elements: { 
                    avatarBox: 'rounded-full h-10 w-10',
                    userButtonAvatarBox: 'rounded-full h-10 w-10'
                  } 
                }} 
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}
