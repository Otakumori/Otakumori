'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { trapFocus } from '@/app/lib/accessibility';

export function QuickSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        setQuery('');
      }
    },
    [query, router],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        previousActiveElement.current = document.activeElement as HTMLElement;
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Focus input and trap focus
    inputRef.current?.focus();
    
    let cleanup: (() => void) | undefined;
    if (modalRef.current) {
      cleanup = trapFocus(modalRef.current, previousActiveElement.current || undefined);
    }

    return () => {
      cleanup?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Search modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl"
        tabIndex={-1}
      >
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-pink-400" />
          <label htmlFor="quick-search-input" className="sr-only">
            Search for treasures
          </label>
          <input
            id="quick-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for treasures..."
            className="w-full bg-transparent border-0 pl-16 pr-16 py-6 text-white placeholder-zinc-400 text-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent rounded-2xl"
            ref={inputRef}
            aria-label="Search for treasures"
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>
        </form>

        {/* Keyboard hint */}
        <div className="border-t border-white/10 px-6 py-3 flex items-center gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">↵</kbd>
            <span>to search</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">ESC</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
