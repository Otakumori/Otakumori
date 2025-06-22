'use strict';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.Header = void 0;
const react_1 = __importDefault(require('react'));
const link_1 = __importDefault(require('next/link'));
const lucide_react_1 = require('lucide-react');
const Header = () => {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <link_1.default href="/" className="flex items-center space-x-2">
            <img
              src="/assets/logo.png"
              alt="Otaku-mori"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-xl font-bold text-white">Otaku-mori</span>
          </link_1.default>

          {/* Navigation */}
          <nav className="hidden items-center space-x-8 md:flex">
            <link_1.default
              href="/shop"
              className="text-gray-300 transition-colors hover:text-white"
            >
              Shop
            </link_1.default>
            <link_1.default
              href="/blog"
              className="text-gray-300 transition-colors hover:text-white"
            >
              Blog
            </link_1.default>
            <link_1.default
              href="/mini-games"
              className="text-gray-300 transition-colors hover:text-white"
            >
              Mini-Games
            </link_1.default>
            <link_1.default
              href="/community"
              className="text-gray-300 transition-colors hover:text-white"
            >
              Community
            </link_1.default>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-300 transition-colors hover:text-white">
              <lucide_react_1.Search className="h-5 w-5" />
            </button>
            <link_1.default
              href="/shop/cart"
              className="text-gray-300 transition-colors hover:text-white"
            >
              <lucide_react_1.ShoppingCart className="h-5 w-5" />
            </link_1.default>
            <link_1.default
              href="/login"
              className="rounded-lg bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
            >
              Log in
            </link_1.default>
          </div>
        </div>
      </div>
    </header>
  );
};
exports.Header = Header;
exports.default = exports.Header;
