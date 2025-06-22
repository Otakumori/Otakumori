'use strict';
'use client';
'use client';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const react_1 = __importStar(require('react'));
const link_1 = __importDefault(require('next/link'));
const image_1 = __importDefault(require('next/image'));
const framer_motion_1 = require('framer-motion');
const CartProvider_1 = require('../cart/CartProvider');
const lucide_react_1 = require('lucide-react');
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = (0, react_1.useState)(false);
  const { itemCount } = (0, CartProvider_1.useCart)();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <header className="sticky top-0 z-50 w-full bg-black/50 backdrop-blur-lg">
      {/* Skip to content for accessibility */}
      <a
        href="#main-content"
        className="sr-only absolute left-2 top-2 z-50 rounded bg-pink-400/80 px-3 py-1 text-white focus:not-sr-only"
      >
        Skip to main content
      </a>
      <nav
        className="container mx-auto flex items-center justify-between px-4 py-3"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <link_1.default href="/" aria-label="Home">
          <image_1.default
            src="/assets/logo.png"
            alt="Otaku-mori Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </link_1.default>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 text-white md:flex">
          <link_1.default
            href="/shop"
            className="transition-colors hover:text-pink-500"
            aria-label="Shop"
          >
            Shop
          </link_1.default>
          <link_1.default
            href="/community"
            className="transition-colors hover:text-pink-500"
            aria-label="Community"
          >
            Community
          </link_1.default>
          <link_1.default
            href="/achievements"
            className="transition-colors hover:text-pink-500"
            aria-label="Achievements"
          >
            Achievements
          </link_1.default>
          <link_1.default
            href="/events"
            className="transition-colors hover:text-pink-500"
            aria-label="Events"
          >
            Events
          </link_1.default>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <link_1.default
            href="/wishlist"
            className="text-white transition-colors hover:text-pink-500"
            aria-label="Wishlist"
          >
            <lucide_react_1.Heart size={20} />
          </link_1.default>
          <link_1.default
            href="/achievements"
            className="text-white transition-colors hover:text-pink-500"
            aria-label="Achievements"
          >
            <lucide_react_1.Gift size={20} />
          </link_1.default>
          <link_1.default
            href="/cart"
            className="relative text-white transition-colors hover:text-pink-500"
            aria-label="Cart"
          >
            <lucide_react_1.ShoppingCart size={20} />
            {itemCount > 0 && (
              <span
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                aria-label={`Cart items: ${itemCount}`}
              >
                {itemCount}
              </span>
            )}
          </link_1.default>
          <link_1.default
            href="/profile"
            className="text-white transition-colors hover:text-pink-500"
            aria-label="Profile"
          >
            <lucide_react_1.User size={20} />
          </link_1.default>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-white"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <lucide_react_1.X size={24} /> : <lucide_react_1.Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <framer_motion_1.AnimatePresence>
        {isMenuOpen && (
          <framer_motion_1.motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black/90 backdrop-blur-lg md:hidden"
            role="menu"
            aria-label="Mobile navigation"
          >
            <link_1.default
              href="/shop"
              className="text-2xl text-white"
              aria-label="Shop"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </link_1.default>
            <link_1.default
              href="/community"
              className="text-2xl text-white"
              aria-label="Community"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </link_1.default>
            <link_1.default
              href="/achievements"
              className="text-2xl text-white"
              aria-label="Achievements"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              Achievements
            </link_1.default>
            <link_1.default
              href="/events"
              className="text-2xl text-white"
              aria-label="Events"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </link_1.default>
            <link_1.default
              href="/profile"
              className="text-2xl text-white"
              aria-label="Profile"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </link_1.default>
            <button
              onClick={toggleMenu}
              className="absolute right-4 top-4 text-white"
              aria-label="Close menu"
            >
              <lucide_react_1.X size={32} />
            </button>
          </framer_motion_1.motion.div>
        )}
      </framer_motion_1.AnimatePresence>
    </header>
  );
};
exports.default = Navbar;
