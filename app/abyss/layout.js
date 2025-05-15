'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AbyssLayout({ children }) {
  const { data: session } = useSession();
  const [isAbyssMode, setIsAbyssMode] = useState(false);

  useEffect(() => {
    // Check if user has enabled Abyss mode
    const abyssMode = localStorage.getItem('abyssMode') === 'true';
    setIsAbyssMode(abyssMode);
  }, []);

  const toggleAbyssMode = () => {
    const newMode = !isAbyssMode;
    setIsAbyssMode(newMode);
    localStorage.setItem('abyssMode', newMode.toString());
  };

  return (
    <div className={`min-h-screen ${isAbyssMode ? 'bg-black' : 'bg-gray-900'}`}>
      {/* Abyss Navigation */}
      <nav className="bg-gray-800 border-b border-pink-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/abyss" className="text-pink-500 font-bold text-xl">
                The Abyss
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link href="/abyss/shop" className="text-gray-300 hover:text-pink-500">
                  Shop
                </Link>
                <Link href="/abyss/community" className="text-gray-300 hover:text-pink-500">
                  Community
                </Link>
                <Link href="/abyss/gallery" className="text-gray-300 hover:text-pink-500">
                  Gallery
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleAbyssMode}
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                {isAbyssMode ? 'Disable Abyss Mode' : 'Enable Abyss Mode'}
              </button>
              <Link href="/" className="text-gray-300 hover:text-pink-500">
                Return to Surface
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Abyss Footer */}
      <footer className="bg-gray-800 border-t border-pink-900 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Otakumori - The Abyss
            </p>
            <div className="flex space-x-4">
              <Link href="/abyss/terms" className="text-gray-400 hover:text-pink-500 text-sm">
                Terms
              </Link>
              <Link href="/abyss/privacy" className="text-gray-400 hover:text-pink-500 text-sm">
                Privacy
              </Link>
              <Link href="/abyss/help" className="text-gray-400 hover:text-pink-500 text-sm">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 