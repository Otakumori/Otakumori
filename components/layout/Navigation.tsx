/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { appUrl } from '@/lib/canonical';
import { useCart } from '../cart/CartProvider';
import { Menu, X, ShoppingCart, User, Search, ChevronDown } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { 
    name: 'Shop', 
    href: '/shop',
    dropdown: [
      {
        category: 'Apparel',
        items: [
          { name: 'Tops', href: '/shop?category=tops' },
          { name: 'Bottoms', href: '/shop?category=bottoms' },
          { name: 'Unmentionables', href: '/shop?category=unmentionables' },
          { name: 'Kicks', href: '/shop?category=kicks' },
        ]
      },
      {
        category: 'Accessories',
        items: [
          { name: 'Pins', href: '/shop?category=pins' },
          { name: 'Hats', href: '/shop?category=hats' },
          { name: 'Bows', href: '/shop?category=bows' },
        ]
      },
      {
        category: 'Home Decor',
        items: [
          { name: 'Cups', href: '/shop?category=cups' },
          { name: 'Pillows', href: '/shop?category=pillows' },
          { name: 'Stickers', href: '/shop?category=stickers' },
        ]
      }
    ]
  },
  { name: 'Blog', href: '/blog' },
  { name: 'Mini-Games', href: '/mini-games' },
  { name: 'About me', href: '/about' },
];

const mobileNavigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Blog', href: '/blog' },
  { name: 'Mini-Games', href: '/mini-games' },
  { name: 'About me', href: '/about' },
  { name: 'Cart', href: '/cart' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsOpen(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/80 backdrop-blur-md border-b border-pink-500/20'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🌸</span>
                </div>
                <span className="text-xl font-bold text-white">Otakumori</span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.dropdown ? (
                    <div
                      className="flex items-center space-x-1 cursor-pointer text-sm font-medium transition-colors text-gray-300 hover:text-pink-400"
                      onMouseEnter={() => setShopDropdownOpen(true)}
                      onMouseLeave={() => setShopDropdownOpen(false)}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="h-4 w-4" />
                      
                      {/* Shop Dropdown */}
                      <AnimatePresence>
                        {shopDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 mt-2 w-80 bg-gray-900 border border-pink-500/20 rounded-lg shadow-xl backdrop-blur-md"
                            onMouseEnter={() => setShopDropdownOpen(true)}
                            onMouseLeave={() => setShopDropdownOpen(false)}
                          >
                            <div className="p-4 space-y-4">
                              {item.dropdown.map((category) => (
                                <div key={category.category}>
                                  <h3 className="text-pink-400 font-semibold mb-2">{category.category}</h3>
                                  <div className="space-y-1">
                                    {category.items.map((subItem) => (
                                      <Link
                                        key={subItem.name}
                                        href={subItem.href}
                                        className="block text-gray-300 hover:text-pink-400 text-sm py-1 transition-colors"
                                      >
                                        {subItem.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'text-pink-400'
                          : 'text-gray-300 hover:text-pink-400'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button className="hidden md:flex p-2 text-gray-300 hover:text-pink-400 transition-colors">
                <Search className="h-5 w-5" />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-300 hover:text-pink-400 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-pink-500 text-xs text-white flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isSignedIn ? (
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8',
                    },
                  }}
                />
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <SignInButton mode="modal" afterSignInUrl={appUrl("/")} afterSignUpUrl={appUrl("/onboarding")}>
                    <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-pink-400 transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal" afterSignInUrl={appUrl("/")} afterSignUpUrl={appUrl("/onboarding")}>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors">
                      Join the quest
                    </button>
                  </SignUpButton>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-pink-400 transition-colors"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeMobileMenu}
            />

            {/* Mobile menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute right-0 top-0 h-full w-80 bg-gray-900 border-l border-pink-500/20"
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-pink-500/20">
                  <span className="text-lg font-semibold text-white">Menu</span>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 text-gray-300 hover:text-pink-400 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Navigation items */}
                <nav className="flex-1 px-6 py-6">
                  <div className="space-y-4">
                    {mobileNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={`block text-lg font-medium transition-colors ${
                          pathname === item.href
                            ? 'text-pink-400'
                            : 'text-gray-300 hover:text-pink-400'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </nav>

                {/* Footer */}
                <div className="border-t border-pink-500/20 p-6">
                  {isSignedIn ? (
                    <div className="flex items-center space-x-3">
                      <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                          elements: {
                            avatarBox: 'h-10 w-10',
                          },
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                        </p>
                        <p className="text-xs text-gray-400">Signed in</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <SignInButton mode="modal" afterSignInUrl={appUrl("/")} afterSignUpUrl={appUrl("/onboarding")}>
                        <button className="w-full px-4 py-3 text-sm font-medium text-gray-300 border border-pink-500/30 hover:bg-pink-500/10 rounded-lg transition-colors">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal" afterSignInUrl={appUrl("/")} afterSignUpUrl={appUrl("/onboarding")}>
                        <button className="w-full px-4 py-3 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors">
                          Join the quest
                        </button>
                      </SignUpButton>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
