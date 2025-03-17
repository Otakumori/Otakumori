"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        scrolled ? "bg-black/80 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <Image
              src="/assets/circlelogo.png"
              alt="Otakumori Logo"
              width={50}
              height={50}
              className="rounded-full border-2 border-white"
            />
            <span className="text-white text-2xl font-bold">Otakumori</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8 text-white text-lg">
          <Link href="/">Home</Link>

          {/* Shop Dropdown */}
          <div className="relative group">
            <button className="focus:outline-none">Shop ⬇️</button>
            <div className="absolute left-0 mt-2 w-52 bg-black/90 p-2 rounded-lg shadow-lg hidden group-hover:block">
              <Link href="/shop" className="block py-1 px-3 hover:bg-gray-800">Shop All</Link>
              <div className="border-b border-gray-600 my-1"></div>
              <Link href="/shop/apparel" className="block py-1 px-3 hover:bg-gray-800">Apparel</Link>
              <Link href="/shop/homedecor" className="block py-1 px-3 hover:bg-gray-800">Home Decor</Link>
              <Link href="/shop/accessories" className="block py-1 px-3 hover:bg-gray-800">Accessories</Link>
              <Link href="/shop/theabyss" className="block py-1 px-3 text-red-500 hover:bg-red-700">The Abyss 🔞</Link>
            </div>
          </div>

          <Link href="/blog">Blog</Link>
          <Link href="/minigames">Mini Games</Link>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Whattya buyin? 👀"
              className="w-48 p-2 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* Log In / Log Out */}
          <Link href="/login" className="text-pink-400 animate-pulse">
            👉 👈 Log in?
          </Link>
        </nav>
      </div>
    </header>
  );
}

