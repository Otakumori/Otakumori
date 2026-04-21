'use client';

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
import { ShoppingCart, Menu, X, ChevronDown, Heart, MessageCircle } from 'lucide-react';
import { GlobalSearch } from '@/app/components/search/GlobalSearch';
import { useCart } from '@/app/components/cart/CartProvider';

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

const buildShopCategoryHref = (category: string) => `${paths.shop()}?category=${encodeURIComponent(category)}`;

const SHOP_CATEGORY_LINKS = [
  { label: 'Pins & Badges', href: buildShopCategoryHref('pins'), description: 'Limited-run enamel drops and badge sets.' },
  { label: 'Apparel', href: buildShopCategoryHref('apparel'), description: 'Tees, hoodies, and jackets with otaku flair.' },
  { label: 'Accessories', href: buildShopCategoryHref('accessories'), description: 'Keychains, charms, and everyday carry.' },
  { label: 'Wall Art', href: buildShopCategoryHref('prints'), description: 'Poster prints and canvas collabs.' },
];

const GAME_FACE_LINKS = [
  { label: 'Action', href: '/mini-games?face=action', description: 'High-energy battles & slashers.' },
  { label: 'Puzzle', href: '/mini-games?face=puzzle', description: 'Logic trials and rhythm riddles.' },
  { label: 'Strategy', href: '/mini-games?face=strategy', description: 'Plan, adapt, and outsmart rivals.' },
  { label: 'All Games', href: paths.games(), description: 'Browse every cube face and challenge.' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { requireAuthForSoapstone, requireAuthForWishlist, signOut } = useAuthContext();
  const { itemCount } = useCart();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [_scrollY, setScrollY] = useState(0);

  const userMenuAriaExpanded = useMemo(() => showUserMenu, [showUserMenu]);
  const mobileMenuAriaExpanded = useMemo(() => isMenuOpen, [isMenuOpen]);

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) setActiveDropdown(null);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSignedIn) router.push('/wishlist');
    else requireAuthForWishlist(() => router.push('/wishlist'));
  };

  const handleSoapstoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSignedIn) router.push(paths.community());
    else requireAuthForSoapstone(() => router.push(paths.community()));
  };

  return (
    <header
      className={`navbar-scroll relative z-50 w-full font-ui transition-all duration-300 ${isScrolled ? 'scrolled shadow-lg shadow-black/80 border-b border-white/10' : 'border-b border-white/5'}`}
      style={{ backgroundColor: 'var(--color-background)', opacity: isScrolled ? 0.9 : 0.7, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <a href="#main-content" className="sr-only absolute left-2 top-2 z-50 rounded bg-pink-400/80 px-3 py-1 text-white focus:not-sr-only">Skip to main content</a>
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href={paths.home()} className="flex items-center group py-1">
          <div className="relative w-32 h-32 md:w-36 md:h-36">
            <Image src="/assets/images/circlelogo.png" alt="Otaku-mori" fill className="object-contain" />
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-8" ref={megaMenuRef}>
          <Link href={paths.home()} className={`min-h-[44px] flex items-center px-2 text-text-link hover:text-text-link-hover transition-colors ${pathname === paths.home() ? 'text-text-link-hover border-b-2 border-primary' : ''}`}>Home</Link>

          <div className="relative">
            <button onClick={() => setActiveDropdown(activeDropdown === 'shop' ? null : 'shop')} className={`min-h-[44px] flex items-center gap-1 px-2 text-text-link hover:text-text-link-hover transition-colors ${pathname.startsWith('/shop') ? 'text-text-link-hover border-b-2 border-primary' : ''}`} aria-expanded={activeDropdown === 'shop'} aria-label="Shop menu">
              Shop
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'shop' ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {activeDropdown === 'shop' && (
              <div className="absolute top-full left-0 mt-2 w-96 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-6 z-50" onKeyDown={(e) => { if (e.key === 'Escape') setActiveDropdown(null); }} role="dialog" aria-label="Shop menu" tabIndex={-1}>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-white font-semibold mb-3">Featured Products</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Link href={paths.product('featured-1')} className="flex items-center gap-3 rounded-lg p-3 min-h-[44px] transition-colors hover:bg-white/10">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded border border-white/15 bg-white/5 text-xs text-white/70">✦</div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">Featured Drop</p>
                          <p className="text-xs text-text-link-hover">View spotlight item</p>
                        </div>
                      </Link>
                      <div className="col-span-1 flex items-center rounded-lg p-3 text-sm text-white/60">Browse categories to explore live merch without extra navbar fetches.</div>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">Shop by Category</h4>
                    <div className="mt-3 grid gap-2">
                      {SHOP_CATEGORY_LINKS.map((category) => (
                        <Link key={category.href} href={category.href} className="rounded-lg p-4 min-h-[44px] transition-colors hover:bg-white/10">
                          <span className="block text-sm font-medium text-white">{category.label}</span>
                          <span className="mt-1 block text-xs text-white/60">{category.description}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <HeaderButton href={paths.shop()} className="w-full justify-center">View All Products</HeaderButton>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setActiveDropdown(activeDropdown === 'games' ? null : 'games')} className={`min-h-[44px] flex items-center gap-1 px-2 text-text-link hover:text-text-link-hover transition-colors ${pathname.startsWith('/mini-games') ? 'text-text-link-hover border-b-2 border-primary' : ''}`} aria-expanded={activeDropdown === 'games'} aria-label="Mini-games menu">
              Mini-Games
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'games' ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {activeDropdown === 'games' && (
              <div className="absolute top-full left-0 mt-2 w-96 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-6 z-50" onKeyDown={(e) => { if (e.key === 'Escape') setActiveDropdown(null); }} role="dialog" aria-label="Mini-games menu" tabIndex={-1}>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-white font-semibold mb-3">Featured Games</h3>
                    {FEATURED_GAMES.length > 0 ? (
                      <div className="space-y-3">
                        {FEATURED_GAMES.slice(0, 4).map((game) => (
                          <Link key={game.id} href={`/mini-games/${game.id}`} className="flex items-center gap-3 rounded-lg p-4 min-h-[44px] transition-colors hover:bg-white/10">
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-pink-500 to-purple-600 text-white"><span className="text-xs uppercase tracking-wide">{game.status}</span></div>
                            <div>
                              <p className="text-sm font-medium text-white">{game.title}</p>
                              <p className="text-xs text-white/60 line-clamp-2">{game.summary}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/60">The GameCube hub is loading quests. Choose a face to jump right in.</p>
                    )}
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">Navigate Faces</h4>
                    <div className="mt-3 grid gap-2">
                      {GAME_FACE_LINKS.map((face) => (
                        <Link key={face.href} href={face.href} className="rounded-lg p-4 min-h-[44px] transition-colors hover:bg-white/10">
                          <span className="block text-sm font-medium text-white">{face.label}</span>
                          <span className="mt-1 block text-xs text-white/60">{face.description}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <HeaderButton href={paths.games()} className="w-full justify-center">Enter GameCube Hub</HeaderButton>
                </div>
              </div>
            )}
          </div>

          <Link href={paths.blogIndex()} className={`min-h-[44px] flex items-center px-2 text-text-link hover:text-text-link-hover transition-colors ${pathname.startsWith('/blog') ? 'text-text-link-hover border-b-2 border-primary' : ''}`}>Blog</Link>
          <Link href="/about" className={`min-h-[44px] flex items-center px-2 text-text-link hover:text-text-link-hover transition-colors ${pathname === '/about' ? 'text-text-link-hover border-b-2 border-primary' : ''}`}>About</Link>
          <button onClick={handleWishlistClick} className={`min-h-[44px] flex items-center gap-1 px-2 text-text-link hover:text-text-link-hover transition-colors ${pathname === '/wishlist' ? 'text-text-link-hover border-b-2 border-primary' : ''}`} aria-label={isSignedIn ? 'Wishlist' : 'Sign in to access wishlist'}><Heart className="w-5 h-5" aria-hidden="true" /></button>
          <button onClick={handleSoapstoneClick} className={`min-h-[44px] flex items-center gap-1 px-2 text-text-link hover:text-text-link-hover transition-colors ${pathname.startsWith('/community') ? 'text-text-link-hover border-b-2 border-primary' : ''}`} aria-label={isSignedIn ? 'Community' : 'Sign in to access community'}><MessageCircle className="w-5 h-5" aria-hidden="true" /></button>
        </div>

        <div className="flex items-center gap-4">
          <GlobalSearch className="hidden sm:block" />
          <Link href={paths.cart()} className="relative min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-text-link hover:text-text-link-hover transition-colors" aria-label={`Shopping cart with ${itemCount} items`}>
            <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            {itemCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-semibold">{itemCount > 99 ? '99+' : itemCount}</span>}
          </Link>

          <div className="hidden sm:block relative" ref={userMenuRef}>
            {isSignedIn ? (
              <>
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="min-h-[44px] flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="User menu" aria-expanded={userMenuAriaExpanded}>
                  {user?.imageUrl ? <Image src={user.imageUrl} alt={user.fullName || user.firstName || 'User'} width={32} height={32} className="rounded-full border border-white/20" /> : <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-white/20 flex items-center justify-center text-white text-sm font-medium">{user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U'}</div>}
                  <span className="hidden sm:inline text-sm text-white">{user?.fullName || user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User'}</span>
                  <ChevronDown className={`w-4 h-4 text-white transition-transform ${showUserMenu ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg z-50" onKeyDown={(e) => { if (e.key === 'Escape') setShowUserMenu(false); }} role="dialog" aria-label="User menu" tabIndex={-1}>
                    <div className="p-2">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white truncate">{user?.fullName || user?.firstName || 'User'}</p>
                        <p className="text-xs text-white/60 truncate">{user?.emailAddresses?.[0]?.emailAddress || ''}</p>
                      </div>
                      <Link href={paths.profile()} className="block min-h-[44px] px-4 py-3 text-sm text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setShowUserMenu(false)}>Profile</Link>
                      <Link href={paths.account()} className="block min-h-[44px] px-4 py-3 text-sm text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setShowUserMenu(false)}>Account Settings</Link>
                      <Link href={paths.achievements()} className="block min-h-[44px] px-4 py-3 text-sm text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setShowUserMenu(false)}>Achievements</Link>
                      <Link href="/wishlist" className="block min-h-[44px] px-4 py-3 text-sm text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setShowUserMenu(false)}>Wishlist</Link>
                      <button onClick={async () => { setShowUserMenu(false); await signOut(); }} className="w-full text-left min-h-[44px] px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-2 border-t border-white/10 pt-2">Sign Out</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <SignInButton mode="modal"><button className="min-h-[44px] px-4 py-2 bg-transparent border border-current rounded-lg text-text-link hover:text-text-link-hover hover:border-primary transition-all duration-300">Sign In</button></SignInButton>
            )}
          </div>
        </div>

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-white p-2" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuAriaExpanded}>
          {isMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
        </button>
      </nav>

      {isMenuOpen && (
        <>
          <div className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
          <div className="sm:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-black/95 backdrop-blur-lg border-l border-white/20 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white p-2" aria-label="Close menu"><X className="w-6 h-6" aria-hidden="true" /></button>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                <Link href={paths.home()} onClick={() => setIsMenuOpen(false)} className="block min-h-[44px] px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors">Home</Link>
                <div>
                  <button onClick={() => setActiveDropdown(activeDropdown === 'shop' ? null : 'shop')} className="w-full flex items-center justify-between min-h-[44px] px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors" aria-expanded={activeDropdown === 'shop'} aria-label="Shop menu"><span>Shop</span><ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === 'shop' ? 'rotate-180' : ''}`} aria-hidden="true" /></button>
                  {activeDropdown === 'shop' && <div className="pl-4 mt-1 space-y-1">{SHOP_CATEGORY_LINKS.map((category) => <Link key={category.href} href={category.href} onClick={() => { setIsMenuOpen(false); setActiveDropdown(null); }} className="block min-h-[44px] px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg transition-colors"><span className="block text-sm font-medium">{category.label}</span><span className="block text-xs text-white/60 mt-1">{category.description}</span></Link>)}<Link href={paths.shop()} onClick={() => { setIsMenuOpen(false); setActiveDropdown(null); }} className="block min-h-[44px] px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg transition-colors">View All Products</Link></div>}
                </div>
                <div>
                  <button onClick={() => setActiveDropdown(activeDropdown === 'games' ? null : 'games')} className="w-full flex items-center justify-between min-h-[44px] px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors" aria-expanded={activeDropdown === 'games'} aria-label="Mini-games menu"><span>Mini-Games</span><ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === 'games' ? 'rotate-180' : ''}`} aria-hidden="true" /></button>
                  {activeDropdown === 'games' && <div className="pl-4 mt-1 space-y-1">{GAME_FACE_LINKS.map((face) => <Link key={face.href} href={face.href} onClick={() => { setIsMenuOpen(false); setActiveDropdown(null); }} className="block min-h-[44px] px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg transition-colors"><span className="block text-sm font-medium">{face.label}</span><span className="block text-xs text-white/60 mt-1">{face.description}</span></Link>)}<Link href={paths.games()} onClick={() => { setIsMenuOpen(false); setActiveDropdown(null); }} className="block min-h-[44px] px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg transition-colors">Enter GameCube Hub</Link></div>}
                </div>
                <Link href={paths.blogIndex()} onClick={() => setIsMenuOpen(false)} className="block min-h-[44px] px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors">Blog</Link>
                <Link href="/about" onClick={() => setIsMenuOpen(false)} className="block min-h-[44px] px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors">About</Link>
                <button onClick={(e) => { setIsMenuOpen(false); handleWishlistClick(e); }} className="w-full flex items-center gap-2 min-h-[44px] px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors" aria-label={isSignedIn ? 'Wishlist' : 'Sign in to access wishlist'}><Heart className="w-5 h-5" aria-hidden="true" /><span>Wishlist</span></button>
                <button onClick={(e) => { setIsMenuOpen(false); handleSoapstoneClick(e); }} className="w-full flex items-center gap-2 min-h-[44px] px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors" aria-label={isSignedIn ? 'Community' : 'Sign in to access community'}><MessageCircle className="w-5 h-5" aria-hidden="true" /><span>Community</span></button>
                <Link href={paths.cart()} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 min-h-[44px] px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors" aria-label={`Shopping cart with ${itemCount} items`}><ShoppingCart className="w-5 h-5" aria-hidden="true" /><span>Cart</span>{itemCount > 0 && <span className="ml-auto bg-primary text-white text-xs rounded-full min-w-[20px] h-5 px-2 flex items-center justify-center font-semibold">{itemCount > 99 ? '99+' : itemCount}</span>}</Link>
              </nav>

              <div className="p-4 border-t border-white/10">
                {isSignedIn ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-2">
                      {user?.imageUrl ? <Image src={user.imageUrl} alt={user.fullName || user.firstName || 'User'} width={32} height={32} className="rounded-full border border-white/20" /> : <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-white/20 flex items-center justify-center text-white text-sm font-medium">{user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U'}</div>}
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{user?.fullName || user?.firstName || 'User'}</p><p className="text-xs text-white/60 truncate">{user?.emailAddresses?.[0]?.emailAddress || ''}</p></div>
                    </div>
                    <Link href={paths.profile()} onClick={() => setIsMenuOpen(false)} className="block min-h-[44px] px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg transition-colors">Profile</Link>
                    <button onClick={async () => { setIsMenuOpen(false); await signOut(); }} className="w-full text-left min-h-[44px] px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">Sign Out</button>
                  </div>
                ) : (
                  <SignInButton mode="modal"><button className="w-full min-h-[44px] px-4 py-3 bg-transparent border border-current rounded-lg text-white hover:bg-white/10 transition-colors">Sign In</button></SignInButton>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
