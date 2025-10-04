'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/cn';

const links = [
  { href: '/', label: 'Home' },
  { href: '/mini-games', label: 'Games' },
  { href: '/shop', label: 'Shop' },
  { href: '/community', label: 'Community' },
];

export default function NavbarNew() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-bg/60 border-b border-white/5">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-brand" />
          <span className="font-display text-lg font-semibold">Otaku-mori</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {links.map((l) => {
            const active = pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm transition',
                  active
                    ? 'bg-card text-fg shadow-brand'
                    : 'text-muted hover:text-fg hover:bg-card',
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border border-white/10 bg-card px-3 py-2 text-sm hover:border-white/20"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            className="rounded-xl border border-white/10 bg-card px-3 py-2 text-sm hover:border-white/20"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
