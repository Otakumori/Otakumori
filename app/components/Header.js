"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-[#1a1a1a] bg-opacity-90 backdrop-blur-lg shadow-lg z-50 font-['Roboto Condensed'] tracking-wide">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/">
          <Image
            src="/assets/circlelogo.png"
            alt="Otakumori Logo"
            width={50}
            height={50}
            className="rounded-full cursor-pointer border-2 border-pink-500 shadow-lg hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8 text-white text-lg">
          <Link href="/" className="hover:text-pink-500">Home</Link>
          <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none hover:text-pink-500">
              Shop ⌄
            </button>
            {isOpen && (
              <div className="absolute bg-[#1a1a1a] bg-opacity-95 mt-2 p-2 rounded-md shadow-lg text-sm">
                <Link href="/shop/apparel" className="block px-4 py-2 hover:text-pink-400">Apparel</Link>
                <Link href="/shop/decor" className="block px-4 py-2 hover:text-pink-400">Home Decor</Link>
                <Link href="/shop/accessories" className="block px-4 py-2 hover:text-pink-400">Accessories</Link>
                <Link href="/shop/abyss" className="block px-4 py-2 text-red-500 hover:text-red-400">The Abyss 🔞</Link>
              </div>
            )}
          </div>
          <Link href="/blog" className="hover:text-pink-500">Blog</Link>
          <Link href="/mini-games" className="hover:text-pink-500">Mini Games</Link>
        </nav>

        {/* Search & Login */}
        <div className="flex space-x-4 text-white">
          <input type="text" placeholder="Whattya buyin'? 🛒" 
            className="rounded-md p-2 text-black border-2 border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button className="bg-pink-500 px-4 py-2 rounded-md hover:bg-pink-600 transition duration-300">
            Log In
          </button>
        </div>
      </div>
    </header>
  );
}
