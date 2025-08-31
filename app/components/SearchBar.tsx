'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SearchRequest,
  SearchResponse,
  SearchSuggestionRequest,
  SearchSuggestionResponse,
  SearchResult,
} from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';

interface SearchBarProps {
  placeholder?: string;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = 'Search people, products, content...',
  onResultClick,
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<'all' | 'people' | 'content' | 'products'>('all');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadRecentSearches = async () => {
    try {
      const response = await fetch('/api/v1/search/history?limit=5');
      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          const recent = data.data.history.map((h: any) => h.query).slice(0, 5);
          setRecentSearches(recent);
        }
      }
    } catch (error) {
      logger.warn('Failed to load recent searches', {
        extra: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  };

  const handleInputChange = async (value: string) => {
    setQuery(value);

    if (value.length > 0) {
      setIsOpen(true);
      await fetchSuggestions(value);
    } else {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      setIsLoading(true);

      const request: SearchSuggestionRequest = {
        query: searchQuery,
        searchType,
        limit: 5,
      };

      const response = await fetch('/api/v1/search/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const data: { ok: boolean; data: SearchSuggestionResponse } = await response.json();
        if (data.ok) {
          setSuggestions(data.data.suggestions);
        }
      }
    } catch (error) {
      logger.warn('Failed to fetch search suggestions', {
        extra: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setIsOpen(false);

      const request: SearchRequest = {
        query: searchQuery,
        searchType,
        limit: 20,
        offset: 0,
      };

      const response = await fetch('/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const data: { ok: boolean; data: SearchResponse } = await response.json();
        if (data.ok && onResultClick) {
          // For now, just log the results - in a real implementation,
          // you'd want to show them in a results page or modal
          logger.info('Search completed', {
            extra: {
              query: searchQuery,
              resultCount: data.data.results.length,
            },
          });
        }
      }
    } catch (error) {
      logger.error('Search failed', {
        extra: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const selectSuggestion = (suggestion: any) => {
    setQuery(suggestion.query);
    handleSearch(suggestion.query);
  };

  const selectRecentSearch = (recentQuery: string) => {
    setQuery(recentQuery);
    handleSearch(recentQuery);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}

        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
          </div>
        )}
      </div>

      {/* Search Type Filter */}
      <div className="flex gap-1 mt-2">
        {(['all', 'people', 'content', 'products'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSearchType(type)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              searchType === type
                ? 'bg-pink-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            {/* Recent Searches */}
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock className="h-4 w-4" />
                  Recent Searches
                </div>
                {recentSearches.map((recent, index) => (
                  <button
                    key={index}
                    onClick={() => selectRecentSearch(recent)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    {recent}
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2"
                  >
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {suggestion.suggestionType}
                    </span>
                    {suggestion.query}
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {query.length > 0 && suggestions.length === 0 && !isLoading && (
              <div className="p-3 text-sm text-gray-500 text-center">
                No suggestions found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
