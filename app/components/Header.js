'use client';
import Image from 'next/image';
import Link from 'next/link';
import NavAuth from './NavAuth';

export default function Header() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-black/80 shadow-lg backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between p-4">
        {/* Logo */}
        <Link href="/">
          <div className="flex cursor-pointer items-center space-x-3">
            <Image
              src="/assets/circlelogo.png"
              alt="Otakumori Logo"
              width={50}
              height={50}
              className="rounded-full border-2 border-white"
            />
            <span className="text-2xl font-bold text-white">Otakumori</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden space-x-8 text-lg text-white md:flex" aria-label="Main navigation">
          <Link href="/" className="hover:text-purple-400 transition-colors">
            Home
          </Link>

          {/* Shop Dropdown */}
          <div className="group relative">
            <button
              className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black hover:text-purple-400 transition-colors"
              aria-expanded="false"
              aria-haspopup="true"
              aria-label="Shop menu"
            >
              Shop
            </button>
            <div
              className="absolute left-0 mt-2 hidden w-52 rounded-lg bg-black/90 p-2 shadow-lg group-hover:block"
              role="menu"
              aria-label="Shop submenu"
            >
              <Link
                href="/shop"
                className="block px-3 py-1 hover:bg-gray-800 transition-colors"
                role="menuitem"
              >
                Shop All
              </Link>
              <div className="my-1 border-b border-gray-600" role="separator"></div>
              <Link
                href="/shop/apparel"
                className="block px-3 py-1 hover:bg-gray-800 transition-colors"
                role="menuitem"
              >
                Apparel
              </Link>
              <Link
                href="/shop/homedecor"
                className="block px-3 py-1 hover:bg-gray-800 transition-colors"
                role="menuitem"
              >
                Home Decor
              </Link>
              <Link
                href="/shop/accessories"
                className="block px-3 py-1 hover:bg-gray-800 transition-colors"
                role="menuitem"
              >
                Accessories
              </Link>
              <Link
                href="/shop/theabyss"
                className="block px-3 py-1 text-red-500 hover:bg-red-700 transition-colors"
                role="menuitem"
                aria-label="The Abyss - Adult content"
              >
                The Abyss{' '}
                <span role="img" aria-label="Adult content warning">
                  🔞
                </span>
              </Link>
            </div>
          </div>

          <Link href="/blog" className="hover:text-purple-400 transition-colors">
            Blog
          </Link>
          <Link href="/mini-games" className="hover:text-purple-400 transition-colors">
            Mini Games
          </Link>

          {/* Search Bar */}
          <div className="relative">
            <label htmlFor="search-input" className="sr-only">
              Search products
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="Whattrya buying?"
              className="w-48 rounded-lg bg-gray-900 p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Search products"
            />
          </div>

          {/* Auth Component */}
          <NavAuth />
        </nav>
      </div>
    </header>
  );
}
