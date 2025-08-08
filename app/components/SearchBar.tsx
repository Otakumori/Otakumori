import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface SearchResult {
  id: string;
  title: string;
  type: 'product' | 'blog' | 'achievement' | 'user';
  url: string;
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchItems = async () => {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchItems();
  }, [debouncedQuery]);

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative">
      <motion.div
        initial={{ width: '40px' }}
        animate={{ width: isOpen ? '300px' : '40px' }}
        className="relative"
      >
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={isOpen ? "What're ya buyin'?" : ''}
          className="h-10 w-full rounded-full border border-pink-500/30 bg-gray-800/50 pl-10 pr-4 text-white placeholder-pink-300/50 backdrop-blur-sm transition-all duration-300 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (query || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full mt-2 max-h-[400px] overflow-hidden overflow-y-auto rounded-lg border border-pink-500/30 bg-gray-900/95 shadow-lg backdrop-blur-sm"
          >
            {isLoading ? (
              <div className="p-4 text-center text-pink-300">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-pink-500" />
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map(result => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors duration-200 hover:bg-pink-500/10"
                  >
                    <span className="text-pink-500">
                      {result.type === 'product' && '🛍️'}
                      {result.type === 'blog' && '📝'}
                      {result.type === 'achievement' && '🏆'}
                      {result.type === 'user' && '👤'}
                    </span>
                    <span className="text-white">{result.title}</span>
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="p-4 text-center text-pink-300">No results found</div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
