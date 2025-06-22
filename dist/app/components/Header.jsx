'use strict';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = Header;
const react_1 = require('react');
const link_1 = __importDefault(require('next/link'));
const navigation_1 = require('next/navigation');
const react_2 = require('next-auth/react');
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/minigames', label: 'Mini-Games' },
  { href: '/friends', label: 'Friends' },
  { href: '/profile', label: 'My Account' },
  { href: '/community', label: 'Community' },
];
function Header() {
  const [isSearchOpen, setIsSearchOpen] = (0, react_1.useState)(false);
  const [mobileOpen, setMobileOpen] = (0, react_1.useState)(false);
  const [scrolled, setScrolled] = (0, react_1.useState)(false);
  const pathname = (0, navigation_1.usePathname)();
  const { data: session } = (0, react_2.useSession)();
  (0, react_1.useEffect)(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <link_1.default href="/" className="text-xl font-bold text-white">
              OtakuMori
            </link_1.default>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-white">{session.user.name}</span>
                <button
                  onClick={() => (0, react_2.signOut)()}
                  className="text-white hover:text-gray-300"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => (0, react_2.signIn)()}
                className="text-white hover:text-gray-300"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
