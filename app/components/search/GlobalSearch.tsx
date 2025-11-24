'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { SearchAutocomplete } from './SearchAutocomplete';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  className?: string;
}

const HISTORY_STORAGE_KEY = 'search-history';
const HISTORY_LIMIT = 10;

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Save search to history
  const saveToHistory = useCallback((term: string) => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      const history = saved ? JSON.parse(saved) : [];
      const filtered = history.filter((item: string) => item !== term);
      const updated = [term, ...filtered].slice(0, HISTORY_LIMIT);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore errors
    }
  }, []);

  // Cmd/Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = useCallback(
    (term: string) => {
      setQuery(term);
      setIsOpen(false);
      saveToHistory(term);
      router.push(`/search?q=${encodeURIComponent(term)}`);
    },
    [router, saveToHistory],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSelect(query.trim());
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors',
          className,
        )}
        aria-label="Open search (Cmd+K or Ctrl+K)"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline text-sm">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-white/40 border border-white/20 rounded">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full max-w-2xl', className)}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search products, games, blog posts..."
            className="w-full pl-12 pr-12 py-3 rounded-xl border border-white/20 bg-black/60 backdrop-blur-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50"
            autoComplete="off"
            aria-label="Search"
            aria-expanded={isFocused}
            aria-controls="search-autocomplete"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <SearchAutocomplete
          query={query}
          onSelect={handleSelect}
          onClose={() => setIsOpen(false)}
          isOpen={isFocused && (query.length >= 2 || query.length === 0)}
        />
      </form>
    </div>
  );
}
