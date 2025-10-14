'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Search modal */}
      <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-pink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for treasures..."
            className="w-full bg-transparent border-0 pl-16 pr-16 py-6 text-white placeholder-zinc-400 text-lg focus:outline-none"
            autoFocus
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
