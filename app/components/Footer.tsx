import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Otaku-mori</h3>
            <p className="text-gray-300 text-sm">
              Discover treasures from the digital abyss
            </p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><a href="/shop" className="text-gray-300 hover:text-white text-sm">All Products</a></li>
              <li><a href="/shop/games" className="text-gray-300 hover:text-white text-sm">Games</a></li>
              <li><a href="/shop/merch" className="text-gray-300 hover:text-white text-sm">Merchandise</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Community</h4>
            <ul className="space-y-2">
              <li><a href="/community" className="text-gray-300 hover:text-white text-sm">Forums</a></li>
              <li><a href="/leaderboard" className="text-gray-300 hover:text-white text-sm">Leaderboard</a></li>
              <li><a href="/soapstone" className="text-gray-300 hover:text-white text-sm">Soapstone</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-300 hover:text-white text-sm">Help Center</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white text-sm">Contact Us</a></li>
              <li><a href="/privacy" className="text-gray-300 hover:text-white text-sm">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-gray-300 text-sm text-center">
            © 2024 Otaku-mori. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
