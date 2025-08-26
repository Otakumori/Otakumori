/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';

export function CompactFooter() {
  return (
    <footer className="border-t border-gray-700/50 bg-gradient-to-r from-gray-900/90 to-gray-800/90 py-8 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="mb-1 text-lg font-semibold text-white">Otaku-mori</h3>
            <p className="text-sm text-gray-400">Where cherry blossoms meet pixel art</p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/shop" className="text-gray-300 transition-colors hover:text-white">
              Shop
            </Link>
            <Link href="/mini-games" className="text-gray-300 transition-colors hover:text-white">
              Games
            </Link>
            <Link href="/blog" className="text-gray-300 transition-colors hover:text-white">
              Blog
            </Link>
            <Link href="/about" className="text-gray-300 transition-colors hover:text-white">
              About
            </Link>
            <Link href="/profile" className="text-gray-300 transition-colors hover:text-white">
              Shrine
            </Link>
          </div>

          {/* Legal */}
          <div className="text-center text-xs text-gray-500 md:text-right">
            <div className="flex flex-wrap justify-center gap-4 md:justify-end">
              <Link href="/privacy" className="transition-colors hover:text-gray-400">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-gray-400">
                Terms
              </Link>
              <span>© 2024 Otaku-mori</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
