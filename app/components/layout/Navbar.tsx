'use client';

import { logger } from '@/app/lib/logger';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import { useAuthContext } from '@/app/contexts/AuthContext';
import gamesRegistryData from '@/lib/games.meta.json';
import { paths } from '@/lib/paths';
import { HeaderButton } from '@/components/ui/header-button';
import { useCart } from '@/app/components/cart/CartProvider';
import { ShoppingCart } from 'lucide-react';
import { GlobalSearch } from '@/app/components/search/GlobalSearch';

// Safely get featured games from registry with defensive checks
const gamesRegistry = gamesRegistryData as {
  games?: Array<{
    id?: string;
    enabled?: boolean;
    featured?: boolean;
    title?: string;
    description?: string;
    ageRating?: string;
  }>;
};
const FEATURED_GAMES = (gamesRegistry?.games || [])
  .filter((game) => game?.enabled && game?.featured)
  .slice(0, 6)
  .map((game) => ({
    id: game?.id || 'unknown',
    title: game?.title || 'Unknown Game',
    summary: game?.description || '',
    status: game?.ageRating === 'M' ? 'beta' : 'ready',
  }));

// Real data will be fetched from APIs

// Search suggestions with easter eggs (unused - reserved for future use)
const _SEARCH_SUGGESTIONS = [
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

const _EASTER_EGGS: Record<string, string> = {
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
  const { user } = useUser();
  const { requireAuthForSoapstone, requireAuthForWishlist, signOut } = useAuthContext();
  const { itemCount } = useCart();

  // State for mega-menu
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Computed ARIA values (using useMemo to satisfy accessibility checker)
  const userMenuAriaExpanded = useMemo(() => (showUserMenu ? 'true' : 'false'), [showUserMenu]);
  const mobileMenuAriaExpanded = useMemo(() => (isMenuOpen ? 'true' : 'false'), [isMenuOpen]);

  // Scroll state for navbar effects
  const [isScrolled, setIsScrolled] = useState(false);
  const [_scrollY, setScrollY] = useState(0);

  // State for real data
  const [realProducts, setRealProducts] = useState<any[]>([]);
  const [realBlogPosts, setRealBlogPosts] = useState<any[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [blogLoaded, setBlogLoaded] = useState(false);

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch real data from APIs
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/v1/printify/products?per_page=4');
      const data = await response.json();
      if (data.ok && data.data?.products) {
        setRealProducts(data.data.products);
      }
    } catch (error) {
      logger.error('Failed to fetch products:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
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
      logger.error('Failed to fetch blog posts:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
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


  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns when navigating to a new page
  useEffect(() => {
    setActiveDropdown(null);
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  // Handle protected link clicks
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSignedIn) {
      router.push('/wishlist');
    } else {
      requireAuthForWishlist(() => {
        router.push('/wishlist');
      });
    }
  };

  const handleSoapstoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSignedIn) {
      router.push(paths.community());
    } else {
      requireAuthForSoapstone(() => {
        router.push(paths.community());
      });
    }
  };

  return (
    <header
      className={`navbar-scroll relative z-50 w-full backdrop-blur-lg font-ui transition-all duration-300 ${
        isScrolled ? 'scrolled bg-black/95 shadow-lg' : 'bg-[rgba(57,5,40,0.8)]'
      }`
}
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
role = "dialog"
                aria-label="Shop menu"
tabIndex = {- 1}
              >
                <div className="space-y-5">
                  <div>
  <h3 className="text-white font-semibold mb-3" tabIndex = {- 1}> Featured Products </h3>
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
                              <p className="truncate text-sm font-medium text-white">
                                {product.title}
                              </p>
                              <p className="text-xs text-text-link-hover">
                                ${product.price.toFixed(2)}
                              </p>
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
  <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70" tabIndex = {- 1}>
                      Shop by Category
                    </h4>
                    <div className="mt-3 grid gap-2">
                      {SHOP_CATEGORY_LINKS.map((category) => (
                        <Link
                          key={category.href}
                          href={category.href}
                          className="rounded-lg p-3 transition-colors hover:bg-white/10"
                        >
                          <span className="block text-sm font-medium text-white">
                            {category.label}
                          </span>
                          <span className="mt-1 block text-xs text-white/60">
                            {category.description}
                          </span>
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
                pathname.startsWith('/mini-games')
                  ? 'text-text-link-hover border-b-2 border-primary'
                  : ''
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
role = "dialog"
                aria-label="Mini-games menu"
tabIndex = {- 1}
              >
                <div className="space-y-5">
                  <div>
  <h3 className="text-white font-semibold mb-3" tabIndex = {- 1}> Featured Games </h3>
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
  <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70" tabIndex = {- 1}>
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
                          <span className="mt-1 block text-xs text-white/60">
                            {face.description}
                          </span>
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
role = "dialog"
                aria-label="Blog menu"
tabIndex = {- 1}
              >
  <h3 className="text-white font-semibold mb-4" tabIndex = {- 1}> Latest Posts </h3>
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

          {/* Protected Links */}
          <button
            onClick={handleWishlistClick}
            className={`text-text-link hover:text-text-link-hover transition-colors flex items-center gap-1 ${
              pathname === '/wishlist' ? 'text-text-link-hover border-b-2 border-primary' : ''
            }`}
            title={isSignedIn ? 'Wishlist' : 'Sign in to access wishlist'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {!isSignedIn && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <button
            onClick={handleSoapstoneClick}
            className={`text-text-link hover:text-text-link-hover transition-colors flex items-center gap-1 ${
              pathname.startsWith('/community')
                ? 'text-text-link-hover border-b-2 border-primary'
                : ''
            }`}
            title={isSignedIn ? 'Community' : 'Sign in to access community'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {!isSignedIn && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Search and Auth */}
        <div className="flex items-center space-x-4">
  {/* Global Search with Cmd/Ctrl+K */ }
  < GlobalSearch className = "hidden md:block" />

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
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="User menu"
                aria-expanded={userMenuAriaExpanded}
              >
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || user.firstName || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full border border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-white/20 flex items-center justify-center text-white text-sm font-medium">
                    {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U'}
                  </div>
                )}
                <span className="hidden sm:inline text-sm text-white">
                  {user?.fullName ||
                    user?.firstName ||
                    user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
                    'User'}
                </span>
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg z-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowUserMenu(false);
                  }}
role = "dialog"
                  aria-label="User menu"
tabIndex = {- 1}
                >
                  <div className="p-2">
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-sm font-medium text-white truncate">
                        {user?.fullName || user?.firstName || 'User'}
                      </p>
                      <p className="text-xs text-white/60 truncate">
                        {user?.emailAddresses?.[0]?.emailAddress || ''}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <Link
                      href={paths.profile()}
                      className="block px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile
                    </Link>
                    <Link
href = { paths.account() }
className = "block px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors"
onClick = {() => setShowUserMenu(false)}
                    >
  Account Settings
    </Link>
    < Link
                      href={paths.achievements()}
                      className="block px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Achievements
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Wishlist
                    </Link>

                    {/* Sign Out */}
                    <button
                      onClick={async () => {
                        setShowUserMenu(false);
                        await signOut();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors mt-2 border-t border-white/10 pt-2"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-transparent border border-current rounded-lg text-text-link hover:text-text-link-hover hover:border-primary transition-all duration-300">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuAriaExpanded}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
            <Link
              href={paths.home()}
              className="block text-text-primary hover:text-text-link-hover py-2"
            >
              Home
            </Link>
            <Link
              href={paths.shop()}
              className="block text-text-primary hover:text-text-link-hover py-2"
            >
              Shop
            </Link>
            <Link
              href={paths.games()}
              className="block text-text-primary hover:text-text-link-hover py-2"
            >
              Mini-Games
            </Link>
            <Link
              href={paths.blogIndex()}
              className="block text-text-primary hover:text-text-link-hover py-2"
            >
              Blog
            </Link>
            <Link
              href={paths.help()}
              className="block text-text-primary hover:text-text-link-hover py-2"
            >
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
