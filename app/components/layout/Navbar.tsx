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
import { HeaderButton } from '@/components/ui/header-button';
import { useCart } from '@/app/components/cart/CartProvider';
import { ShoppingCart } from 'lucide-react';

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

const SHOP_CATEGORY_LINKS = [
  {
    label: 'Pins & Badges',
    href: '/shop?category=pins',
    description: 'Limited-run enamel drops and badge sets.',
  },
  {
    label: 'Apparel',
    href: '/shop?category=apparel',
    description: 'Tees, hoodies, and jackets with otaku flair.',
  },
  {
    label: 'Accessories',
    href: '/shop?category=accessories',
    description: 'Keychains, charms, and everyday carry.',
  },
  {
    label: 'Wall Art',
    href: '/shop?category=prints',
    description: 'Poster prints and canvas collabs.',
  },
];

const GAME_FACE_LINKS = [
  {
    label: 'Action',
    href: '/mini-games?face=action',
    description: 'High-energy battles & slashers.',
  },
  {
    label: 'Puzzle',
    href: '/mini-games?face=puzzle',
    description: 'Logic trials and rhythm riddles.',
  },
  {
    label: 'Strategy',
    href: '/mini-games?face=strategy',
    description: 'Plan, adapt, and outsmart rivals.',
  },
  {
    label: 'All Games',
    href: paths.games(),
    description: 'Browse every cube face and challenge.',
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user: _user } = useUser(); // Reserved for future user menu features
  const {
    requireAuthForSoapstone: _requireAuthForSoapstone,
    requireAuthForWishlist: _requireAuthForWishlist,
  } = useAuthContext(); // Reserved for future protected nav links
  const { itemCount } = useCart();

  // State for mega-menu and search
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Scroll state for navbar effects
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

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

  // Handle scroll effects
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          setScrollY(scrollTop);
          setIsScrolled(scrollTop > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Close dropdowns when navigating to a new page
  useEffect(() => {
    setActiveDropdown(null);
    setShowSearchDropdown(false);
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setActiveDropdown(null);
      setShowSearchDropdown(false);
    }
  };

  return (
    <header
      className={`navbar-scroll relative z-50 w-full backdrop-blur-lg font-ui transition-all duration-300 ${
        isScrolled ? 'scrolled bg-black/95 shadow-lg' : 'bg-[rgba(57,5,40,0.8)]'
      }`}
      style={{
        transform: `translateY(${Math.min(scrollY * 0.05, 10)}px)`, // Subtle parallax
      }}
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
          <div className="relative w-32 h-32 md:w-36 md:h-36">
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
            className={`text-text-link hover:text-text-link-hover transition-colors ${
              pathname === paths.home() ? 'text-text-link-hover border-b-2 border-primary' : ''
            }`}
          >
            Home
          </Link>

          {/* Shop with Mega Menu */}
          <div className="relative">
            <button
              onMouseEnter={() => setActiveDropdown('shop')}
              className={`text-text-link hover:text-text-link-hover transition-colors flex items-center ${
                pathname.startsWith('/shop') ? 'text-text-link-hover border-b-2 border-primary' : ''
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
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setActiveDropdown(null);
                }}
                role="menu"
                aria-label="Shop menu"
              >
                <div className="space-y-5">
                  <div>
                    <h3 className="text-white font-semibold mb-3">Featured Products</h3>
                    {productsLoaded && realProducts.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {realProducts.slice(0, 4).map((product) => (
                          <Link
                            key={product.id}
                            href={`/shop/product/${product.id}`}
                            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/10"
                          >
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded border border-white/15 bg-white/5">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.title}
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-xs text-white/70">IMG</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">{product.title}</p>
                              <p className="text-xs text-text-link-hover">${product.price.toFixed(2)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/60">
                        Live products are syncing. Browse categories to start exploring merch.
                      </p>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                      Shop by Category
                    </h4>
                    <div className="mt-3 grid gap-2">
                      {SHOP_CATEGORY_LINKS.map((category) => (
                        <Link
                          key={category.href}
                          href={category.href}
                          className="rounded-lg p-3 transition-colors hover:bg-white/10"
                        >
                          <span className="block text-sm font-medium text-white">{category.label}</span>
                          <span className="mt-1 block text-xs text-white/60">{category.description}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <HeaderButton href={paths.shop()} className="w-full justify-center">
                    View All Products
                  </HeaderButton>
                </div>
              </div>
            )}
          </div>

          {/* Mini-Games with Mega Menu */}
          <div className="relative">
            <button
              onMouseEnter={() => setActiveDropdown('games')}
              className={`text-text-link hover:text-text-link-hover transition-colors flex items-center ${
                pathname.startsWith('/mini-games') ? 'text-text-link-hover border-b-2 border-primary' : ''
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
                <div className="space-y-5">
                  <div>
                    <h3 className="text-white font-semibold mb-3">Featured Games</h3>
                    {FEATURED_GAMES.length > 0 ? (
                      <div className="space-y-3">
                        {FEATURED_GAMES.slice(0, 4).map((game) => (
                          <Link
                            key={game.id}
                            href={`/mini-games/${game.id}`}
                            className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-white/10"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                              <span className="text-xs uppercase tracking-wide">{game.status}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{game.title}</p>
                              <p className="text-xs text-white/60 line-clamp-2">{game.summary}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/60">
                        The GameCube hub is loading quests. Choose a face to jump right in.
                      </p>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                      Navigate Faces
                    </h4>
                    <div className="mt-3 grid gap-2">
                      {GAME_FACE_LINKS.map((face) => (
                        <Link
                          key={face.href}
                          href={face.href}
                          className="rounded-lg p-3 transition-colors hover:bg-white/10"
                        >
                          <span className="block text-sm font-medium text-white">{face.label}</span>
                          <span className="mt-1 block text-xs text-white/60">{face.description}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <HeaderButton href={paths.games()} className="w-full justify-center">
                    Enter GameCube Hub
                  </HeaderButton>
                </div>
              </div>
            )}
          </div>

          {/* Blog with Mega Menu */}
          <div className="relative">
            <button
              onMouseEnter={() => setActiveDropdown('blog')}
              className={`text-text-link hover:text-text-link-hover transition-colors flex items-center ${
                pathname.startsWith('/blog') ? 'text-text-link-hover border-b-2 border-primary' : ''
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
                  className="block text-center text-text-link-hover hover:text-primary-hover text-sm font-medium"
                >
                  View All Posts →
                </Link>
              </div>
            )}
          </div>

          {/* About */}
          <Link
            href="/about"
            className={`text-text-link hover:text-text-link-hover transition-colors ${
              pathname === '/about' ? 'text-text-link-hover border-b-2 border-primary' : ''
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
                      <span className="text-xs text-text-link-hover">{EASTER_EGGS[suggestion]}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <Link
            href={paths.cart()}
            className="relative p-2 text-text-link hover:text-text-link-hover transition-colors"
            aria-label={`Shopping cart with ${itemCount} items`}
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    'w-8 h-8 border border-glass-border hover:border-border-hover transition-colors',
                },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <button
                className="px-4 py-2 bg-transparent border border-current rounded-lg text-text-link hover:text-text-link-hover hover:border-primary transition-all duration-300"
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
            <Link href={paths.home()} className="block text-text-primary hover:text-text-link-hover py-2">
              Home
            </Link>
            <Link href={paths.shop()} className="block text-text-primary hover:text-text-link-hover py-2">
              Shop
            </Link>
            <Link href={paths.games()} className="block text-text-primary hover:text-text-link-hover py-2">
              Mini-Games
            </Link>
            <Link href={paths.blogIndex()} className="block text-text-primary hover:text-text-link-hover py-2">
              Blog
            </Link>
            <Link href={paths.help()} className="block text-text-primary hover:text-text-link-hover py-2">
              About
            </Link>
            <Link
              href={paths.cart()}
              className="flex items-center gap-2 text-text-primary hover:text-text-link-hover py-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Cart
              {itemCount > 0 && (
                <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
