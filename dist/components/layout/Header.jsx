'use strict';
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
exports.default = Header;
const react_1 = __importStar(require('react'));
const link_1 = __importDefault(require('next/link'));
const navigation_1 = require('next/navigation');
const framer_motion_1 = require('framer-motion');
const nextjs_1 = require('@clerk/nextjs');
function Header() {
  const [isMenuOpen, setIsMenuOpen] = (0, react_1.useState)(false);
  const pathname = (0, navigation_1.usePathname)();
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Blog', href: '/blog' },
    { name: 'Mini-Games', href: '/mini-games' },
    { name: 'Community', href: '/community' },
  ];
  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-black/80 backdrop-blur-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <link_1.default href="/" className="flex items-center">
            <span className="text-2xl font-bold text-pink-500">Otaku-mori</span>
          </link_1.default>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            {navItems.map(item => (
              <link_1.default
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href ? 'text-pink-500' : 'text-gray-300 hover:text-pink-500'
                }`}
              >
                {item.name}
              </link_1.default>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <nextjs_1.UserButton afterSignOutUrl="/" />
            <button
              className="text-gray-300 hover:text-pink-500 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <framer_motion_1.AnimatePresence>
          {isMenuOpen && (
            <framer_motion_1.motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden"
            >
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navItems.map(item => (
                  <link_1.default
                    key={item.name}
                    href={item.href}
                    className={`block rounded-md px-3 py-2 text-base font-medium ${
                      pathname === item.href
                        ? 'bg-gray-900 text-pink-500'
                        : 'text-gray-300 hover:bg-gray-900 hover:text-pink-500'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </link_1.default>
                ))}
              </div>
            </framer_motion_1.motion.div>
          )}
        </framer_motion_1.AnimatePresence>
      </nav>
    </header>
  );
}
