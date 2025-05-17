'use client';
import Image from 'next/image';
import Link from 'next/link';

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
        <nav className="hidden space-x-8 text-lg text-white md:flex">
          <Link href="/">Home</Link>

          {/* Shop Dropdown */}
          <div className="group relative">
            <button className="focus:outline-none">Shop</button>
            <div className="absolute left-0 mt-2 hidden w-52 rounded-lg bg-black/90 p-2 shadow-lg group-hover:block">
              <Link href="/shop" className="block px-3 py-1 hover:bg-gray-800">
                Shop All
              </Link>
              <div className="my-1 border-b border-gray-600"></div>
              <Link href="/shop/apparel" className="block px-3 py-1 hover:bg-gray-800">
                Apparel
              </Link>
              <Link href="/shop/homedecor" className="block px-3 py-1 hover:bg-gray-800">
                Home Decor
              </Link>
              <Link href="/shop/accessories" className="block px-3 py-1 hover:bg-gray-800">
                Accessories
              </Link>
              <Link href="/shop/theabyss" className="block px-3 py-1 text-red-500 hover:bg-red-700">
                The Abyss 🔞
              </Link>
            </div>
          </div>

          <Link href="/blog">Blog</Link>
          <Link href="/minigames">Mini Games</Link>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Whattrya buying?"
              className="w-48 rounded-lg bg-gray-900 p-2 text-white placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* Log In / Log Out */}
          <Link href="/login" className="animate-pulse text-pink-400">
            👉 👈 Log in?
          </Link>
        </nav>
      </div>
    </header>
  );
}
