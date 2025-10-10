'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { useAuthContext } from '@/app/contexts/AuthContext';
import gamesRegistry from '@/lib/games.meta.json';
import { paths } from '@/lib/paths';

// Get featured games from registry
const FEATURED_GAMES = gamesRegistry.games
  .filter((game) => game.enabled && game.featured)
  .slice(0, 6)
  .map((game) => ({
    id: game.id,
    title: game.title,
    summary: game.description,
    status: game.ageRating === 'M' ? 'beta' : 'ready',
  }));

// Real data will be fetched from APIs

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
  'what are ya buyin': 'The classic merchant greeting! ',
  stranger: 'Ah, a fellow RE4 fan! Welcome!',
  gamecube: 'Ready for some nostalgic gaming?',
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user: _user } = useUser(); // Reserved for future user menu features
  const {
    requireAuthForSoapstone: _requireAuthForSoapstone,
    requireAuthForWishlist: _requireAuthForWishlist,
  } = useAuthContext(); // Reserved for future protected nav links

  // State for mega-menu and search
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // State for real data
  const [realProducts, setRealProducts] = useState<any[]>([]);
  const [realBlogPosts, setRealBlogPosts] = useState<any[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [blogLoaded, setBlogLoaded] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  // Fetch real data from APIs
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/v1/printify/products?per_page=4');
      const data = await response.json();
      if (data.ok && data.data?.products) {
        setRealProducts(data.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setProductsLoaded(true);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/v1/content/blog?limit=3');
      const data = await response.json();
      if (data.ok && data.data?.posts) {
        setRealBlogPosts(data.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    } finally {
      setBlogLoaded(true);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchProducts();
    fetchBlogPosts();
  }, []);

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
    <header
      className="relative z-50 w-full backdrop-blur-lg font-ui"
      style={{ backgroundColor: 'rgba(57, 5, 40, 0.8)' }}
    >
      {/* Skip to content for accessibility */}
      <a
        href="#main-content"
        className="sr-only absolute left-2 top-2 z-50 rounded bg-pink-400/80 px-3 py-1 text-white focus:not-sr-only"
      >
        Skip to main content
      </a>
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href={paths.home()} className="flex items-center group py-1">
          <div className="relative w-20 h-20">
            <Image
              src="/assets/images/circlelogo.png"
              alt="Otaku-mori"
              fill
              className="object-contain"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8" ref={megaMenuRef}>
          {/* Home */}
          <Link
            href={paths.home()}
            style={{ color: '#835D75' }}
            className={`hover:text-pink-400 transition-colors ${
              pathname === paths.home() ? 'text-pink-400 border-b-2 border-pink-400' : ''
            }`}
          >
            Home
          </Link>

          {/* Shop with Mega Menu */}
          <div className="relative">
            <button
              onMouseEnter={() => setActiveDropdown('shop')}
              style={{ color: '#835D75' }}
              className={`hover:text-pink-400 transition-colors flex items-center ${
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
            {activeDropdown === 'shop' && productsLoaded && realProducts.length > 0 && (
              <div
                className="absolute top-full left-0 mt-2 w-96 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-6 z-50"
                onMouseLeave={() => setActiveDropdown(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setActiveDropdown(null);
                }}
                role="menu"
                aria-label="Shop menu"
              >
                <h3 className="text-white font-semibold mb-4">Featured Products</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {realProducts.slice(0, 4).map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/product/${product.id}`}
                      className="flex items-center space-x-3 p-2 rounded hover:bg-white/10 transition-colors"
                    >
                      <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.title}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-xs text-white">IMG</span>
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium line-clamp-2">
                          {product.title}
                        </p>
                        <p className="text-pink-400 text-sm">${product.price.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href={paths.shop()}
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
              style={{ color: '#835D75' }}
              className={`hover:text-pink-400 transition-colors flex items-center ${
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
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setActiveDropdown(null);
                }}
                role="menu"
                aria-label="Mini-games menu"
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
                        ></span>
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
              style={{ color: '#835D75' }}
              className={`hover:text-pink-400 transition-colors flex items-center ${
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
            {activeDropdown === 'blog' && blogLoaded && realBlogPosts.length > 0 && (
              <div
                className="absolute top-full left-0 mt-2 w-80 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-6 z-50"
                onMouseLeave={() => setActiveDropdown(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setActiveDropdown(null);
                }}
                role="menu"
                aria-label="Blog menu"
              >
                <h3 className="text-white font-semibold mb-4">Latest Posts</h3>
                <div className="space-y-3 mb-4">
                  {realBlogPosts.slice(0, 3).map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="block p-2 rounded hover:bg-white/10 transition-colors"
                    >
                      <p className="text-white text-sm font-medium line-clamp-2">{post.title}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
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
            style={{ color: '#835D75' }}
            className={`hover:text-pink-400 transition-colors ${
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
              <button
                style={{ color: '#835D75' }}
                className="px-4 py-2 bg-transparent border border-current rounded-lg hover:text-pink-400 hover:border-pink-400 transition-all duration-300"
              >
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
            <Link href={paths.home()} className="block text-white hover:text-pink-400 py-2">
              Home
            </Link>
            <Link href={paths.shop()} className="block text-white hover:text-pink-400 py-2">
              Shop
            </Link>
            <Link href={paths.games()} className="block text-white hover:text-pink-400 py-2">
              Mini-Games
            </Link>
            <Link href={paths.blogIndex()} className="block text-white hover:text-pink-400 py-2">
              Blog
            </Link>
            <Link href={paths.help()} className="block text-white hover:text-pink-400 py-2">
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
