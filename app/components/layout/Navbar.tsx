'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { SignInButton, SignOutButton, UserButton } from '@clerk/nextjs';
import { useAuthContext } from '@/app/contexts/AuthContext';

// Game registry for mega-menu
const FEATURED_GAMES = [
  {
    id: 'samurai-petal-slice',
    title: 'Samurai Petal Slice',
    summary: "Draw the Tetsusaiga's arc…",
    status: 'ready',
  },
  {
    id: 'anime-memory-match',
    title: 'Anime Memory Match',
    summary: 'Recall the faces bound by fate.',
    status: 'ready',
  },
  {
    id: 'bubble-pop-gacha',
    title: 'Bubble-Pop Gacha',
    summary: 'Pop for spy-craft secrets…',
    status: 'ready',
  },
  {
    id: 'petal-storm-rhythm',
    title: 'Petal Storm Rhythm',
    summary: "Sync to the Moon Prism's pulse.",
    status: 'ready',
  },
  {
    id: 'quick-math',
    title: 'Quick Math',
    summary: 'Answer fast. Pressure builds with each correct streak.',
    status: 'ready',
  },
  {
    id: 'dungeon-of-desire',
    title: 'Dungeon of Desire',
    summary: 'Descend into the dungeon. Survive rooms and claim rewards.',
    status: 'beta',
  },
];

const SAMPLE_PRODUCTS = [
  {
    id: '1',
    name: 'Sakura Cherry Blossom T-Shirt',
    price: 2999,
    image: '/placeholder-product.jpg',
  },
  { id: '2', name: 'Anime Gaming Controller', price: 4999, image: '/placeholder-product.jpg' },
  { id: '3', name: 'Otaku-mori Sticker Pack', price: 1499, image: '/placeholder-product.jpg' },
  { id: '4', name: 'Mini-Games Poster Collection', price: 1999, image: '/placeholder-product.jpg' },
];

const SAMPLE_POSTS = [
  { id: '1', title: 'Welcome to Otaku-mori: Your New Digital Haven', date: '2024-09-20' },
  { id: '2', title: 'Mini-Games Hub: Complete Guide for Beginners', date: '2024-09-18' },
  { id: '3', title: 'Building a Positive Community Together', date: '2024-09-15' },
];

// Search suggestions with easter eggs
const SEARCH_SUGGESTIONS = [
  'sakura',
  'gaming',
  'anime',
  'merch',
  'petals',
  'mini-games',
  'what are ya buyin',
  'stranger',
  'gamecube',
  'otaku',
];

const EASTER_EGGS: Record<string, string> = {
  'what are ya buyin': 'The classic merchant greeting! 🛍️',
  stranger: 'Ah, a fellow RE4 fan! Welcome!',
  gamecube: 'Ready for some nostalgic gaming?',
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { requireAuthForSoapstone, requireAuthForWishlist } = useAuthContext();

  // State for mega-menu and search
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  // Handle search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      // Fuzzy search suggestions
      const filtered = SEARCH_SUGGESTIONS.filter((suggestion) =>
        suggestion.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 5);
      setSearchSuggestions(filtered);
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
      setSearchQuery('');
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSearchDropdown(false);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setActiveDropdown(null);
      setShowSearchDropdown(false);
    }
  };

  return (
    <header className="relative z-50 w-full bg-black/50 backdrop-blur-lg font-ui">
      {/* Skip to content for accessibility */}
      <a
        href="#main-content"
        className="sr-only absolute left-2 top-2 z-50 rounded bg-pink-400/80 px-3 py-1 text-white focus:not-sr-only"
      >
        Skip to main content
      </a>
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative w-8 h-8">
            <Image
              src="/assets/images/circlelogo.png"
              alt="Otaku-mori"
              fill
              className="object-contain group-hover:scale-110 transition-transform"
            />
          </div>
          <span className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors">
            Otaku-mori
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8" ref={megaMenuRef}>
          {/* Home */}
          <Link
            href="/"
            className={`text-white hover:text-pink-400 transition-colors ${
              pathname === '/' ? 'text-pink-400 border-b-2 border-pink-400' : ''
            }`}
          >
            Home
          </Link>

          {/* Shop with Mega Menu */}
          <div className="relative">
            <button
              onMouseEnter={() => setActiveDropdown('shop')}
              className={`text-white hover:text-pink-400 transition-colors flex items-center ${
                pathname.startsWith('/shop') ? 'text-pink-400 border-b-2 border-pink-400' : ''
              }`}
            >
              Shop
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Shop Mega Menu */}
            {activeDropdown === 'shop' && (
              <div
                className="absolute top-full left-0 mt-2 w-96 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-6 z-50"
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <h3 className="text-white font-semibold mb-4">Featured Products</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {SAMPLE_PRODUCTS.slice(0, 4).map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.id}`}
                      className="flex items-center space-x-3 p-2 rounded hover:bg-white/10 transition-colors"
                    >
                      <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
                        <span className="text-xs text-white">IMG</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-pink-400 text-sm">${(product.price / 100).toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/shop"
                  className="block text-center text-pink-400 hover:text-pink-300 text-sm font-medium"
                >
                  View All Products →
                </Link>
              </div>
            )}
          </div>

          {/* Mini-Games with Mega Menu */}
          <div className="relative">
            <button
              onMouseEnter={() => setActiveDropdown('games')}
              className={`text-white hover:text-pink-400 transition-colors flex items-center ${
                pathname.startsWith('/mini-games') ? 'text-pink-400 border-b-2 border-pink-400' : ''
              }`}
            >
              Mini-Games
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Games Mega Menu */}
            {activeDropdown === 'games' && (
              <div
                className="absolute top-full left-0 mt-2 w-96 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-6 z-50"
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <h3 className="text-white font-semibold mb-4">Featured Games</h3>
                <div className="space-y-3 mb-4">
                  {FEATURED_GAMES.slice(0, 4).map((game) => (
                    <Link
                      key={game.id}
                      href={`/mini-games/${game.id}`}
                      className="flex items-center space-x-3 p-2 rounded hover:bg-white/10 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded flex items-center justify-center">
                        <span
                          className="text-white text-lg"
                          role="img"
                          aria-label="Game controller"
                        >
                          🎮
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{game.title}</p>
                        <p className="text-gray-400 text-xs italic">{game.summary}</p>
                        {game.status === 'beta' && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded">
                            BETA
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/mini-games"
                  className="block text-center text-pink-400 hover:text-pink-300 text-sm font-medium"
                >
                  Enter GameCube Hub →
                </Link>
              </div>
            )}
          </div>

          {/* Blog with Mega Menu */}
          <div className="relative">
            <button
              onMouseEnter={() => setActiveDropdown('blog')}
              className={`text-white hover:text-pink-400 transition-colors flex items-center ${
                pathname.startsWith('/blog') ? 'text-pink-400 border-b-2 border-pink-400' : ''
              }`}
            >
              Blog
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Blog Mega Menu */}
            {activeDropdown === 'blog' && (
              <div
                className="absolute top-full left-0 mt-2 w-80 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-6 z-50"
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <h3 className="text-white font-semibold mb-4">Latest Posts</h3>
                <div className="space-y-3 mb-4">
                  {SAMPLE_POSTS.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.id}`}
                      className="block p-2 rounded hover:bg-white/10 transition-colors"
                    >
                      <p className="text-white text-sm font-medium line-clamp-2">{post.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{post.date}</p>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/blog"
                  className="block text-center text-pink-400 hover:text-pink-300 text-sm font-medium"
                >
                  View All Posts →
                </Link>
              </div>
            )}
          </div>

          {/* About */}
          <Link
            href="/about"
            className={`text-white hover:text-pink-400 transition-colors ${
              pathname === '/about' ? 'text-pink-400 border-b-2 border-pink-400' : ''
            }`}
          >
            About
          </Link>
        </div>

        {/* Search and Auth */}
        <div className="flex items-center space-x-4">
          {/* Enhanced Search */}
          <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="What're ya buyin' ?"
                value={searchQuery}
                onChange={handleSearchInput}
                onKeyDown={handleKeyDown}
                className="w-64 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSearchDropdown && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg py-2 z-50">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center justify-between"
                  >
                    <span>{suggestion}</span>
                    {EASTER_EGGS[suggestion] && (
                      <span className="text-xs text-pink-400">{EASTER_EGGS[suggestion]}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth */}
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    'w-8 h-8 border border-white/20 hover:border-pink-400/50 transition-colors',
                },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-lg border-t border-white/20">
          <div className="px-4 py-2 space-y-2">
            <Link href="/" className="block text-white hover:text-pink-400 py-2">
              Home
            </Link>
            <Link href="/shop" className="block text-white hover:text-pink-400 py-2">
              Shop
            </Link>
            <Link href="/mini-games" className="block text-white hover:text-pink-400 py-2">
              Mini-Games
            </Link>
            <Link href="/blog" className="block text-white hover:text-pink-400 py-2">
              Blog
            </Link>
            <Link href="/about" className="block text-white hover:text-pink-400 py-2">
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
