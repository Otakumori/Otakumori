'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { appUrl } from '@/lib/canonical';
import { useCart } from '../../app/components/cart/CartProvider';
import PetalChip from '@/app/components/nav/PetalChip';
import { Menu, X, ShoppingCart, Search, ChevronDown } from 'lucide-react';
import { motionVariants } from '@/app/components/motion/MotionProvider';

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
        ],
      },
      {
        category: 'Accessories',
        items: [
          { name: 'Pins', href: '/shop?category=pins' },
          { name: 'Hats', href: '/shop?category=hats' },
          { name: 'Bows', href: '/shop?category=bows' },
        ],
      },
      {
        category: 'Home Decor',
        items: [
          { name: 'Cups', href: '/shop?category=cups' },
          { name: 'Pillows', href: '/shop?category=pillows' },
          { name: 'Stickers', href: '/shop?category=stickers' },
        ],
      },
    ],
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
  const { itemCount } = useCart();

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
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-md border-b border-pink-500/20' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/assets/images/circlelogo.png"
                  alt="Otakumori logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-xl font-bold text-white">Otakumori</span>
              </Link>
            </motion.div>

            {/* Desktop Navigation Links */}
            <motion.div
              className="hidden md:flex md:items-center md:space-x-8"
              variants={motionVariants.staggerContainer}
              initial="initial"
              animate="animate"
            >
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  className="relative"
                  variants={motionVariants.staggerItem}
                  custom={index}
                >
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
                                  <h3 className="text-pink-400 font-semibold mb-2">
                                    {category.category}
                                  </h3>
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
                </motion.div>
              ))}
            </motion.div>

            {/* Right side actions */}
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Search */}
              <motion.button
                className="hidden md:flex p-2 text-gray-300 hover:text-pink-400 transition-colors"
                aria-label="Search"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="h-5 w-5" />
              </motion.button>

              {/* Cart */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-300 hover:text-pink-400 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-pink-500 text-xs text-white flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Petal Balance */}
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <PetalChip />
              </motion.div>

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
                  <SignInButton
                    mode="modal"
                    fallbackRedirectUrl={appUrl('/')}
                    forceRedirectUrl={appUrl('/onboarding')}
                  >
                    <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-pink-400 transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton
                    mode="modal"
                    fallbackRedirectUrl={appUrl('/')}
                    forceRedirectUrl={appUrl('/onboarding')}
                  >
                    <button className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors">
                      Join the quest
                    </button>
                  </SignUpButton>
                </div>
              )}

              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-pink-400 transition-colors"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

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
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  closeMobileMenu();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Close mobile menu"
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
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Navigation items */}
                <nav className="flex-1 px-6 py-6">
                  <motion.div
                    className="space-y-4"
                    variants={motionVariants.staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {mobileNavigation.map((item, index) => (
                      <motion.div
                        key={item.name}
                        variants={motionVariants.staggerItem}
                        custom={index}
                      >
                        <Link
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
                      </motion.div>
                    ))}
                  </motion.div>
                </nav>

                {/* Footer */}
                <div className="border-t border-pink-500/20 p-6">
                  {isSignedIn ? (
                    <div className="flex items-center space-x-3">
                      <UserButton
                        userProfileUrl="/profile"
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
                      <SignInButton
                        mode="modal"
                        fallbackRedirectUrl={appUrl('/')}
                        forceRedirectUrl={appUrl('/onboarding')}
                      >
                        <button className="w-full px-4 py-3 text-sm font-medium text-gray-300 border border-pink-500/30 hover:bg-pink-500/10 rounded-lg transition-colors">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton
                        mode="modal"
                        fallbackRedirectUrl={appUrl('/')}
                        forceRedirectUrl={appUrl('/onboarding')}
                      >
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
