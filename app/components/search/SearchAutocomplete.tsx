'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchAutocompleteProps {
  query: string;
  onSelect: (term: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const HISTORY_STORAGE_KEY = 'search-history';
const HISTORY_LIMIT = 5;

export function SearchAutocomplete({
  query,
  onSelect,
  onClose,
  isOpen,
}: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, HISTORY_LIMIT));
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Fetch suggestions from API
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/v1/search/suggestions?q=${encodeURIComponent(query)}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.data?.suggestions) {
            setSuggestions(data.data.suggestions.slice(0, 5));
          }
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items =
        recentSearches.length > 0 && !query.trim()
          ? recentSearches
          : suggestions;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        onSelect(items[selectedIndex] as string);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, recentSearches, suggestions, query, onSelect, onClose]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  if (!isOpen) return null;

  const showRecent = recentSearches.length > 0 && !query.trim();
  const showSuggestions = suggestions.length > 0 && query.trim().length >= 2;
  const hasContent = showRecent || showSuggestions;

  if (!hasContent) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 backdrop-blur-lg bg-black/60 border border-white/20 rounded-xl max-h-96 overflow-y-auto z-50 shadow-2xl"
      role="listbox"
      aria-label="Search suggestions"
      id="search-autocomplete"
    >
      {showRecent && (
        <div className="p-2">
          <div className="flex items-center justify-between px-3 py-2 mb-1">
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
              Recent Searches
            </span>
          </div>
          {recentSearches.map((term, index) => (
            <button
              key={term}
              type="button"
              onClick={() => onSelect(term)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2',
                selectedIndex === index
                  ? 'bg-pink-500/20 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white',
              )}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <Clock className="w-4 h-4 text-white/40" />
              <span className="flex-1">{term}</span>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && (
        <div className="p-2">
          {showRecent && <div className="border-t border-white/10 my-2" />}
          <div className="px-3 py-2 mb-1">
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
              Suggestions
            </span>
          </div>
          {suggestions.map((suggestion, index) => {
            const actualIndex = showRecent
              ? recentSearches.length + index
              : index;
            return (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSelect(suggestion)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2',
                  selectedIndex === actualIndex
                    ? 'bg-pink-500/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white',
                )}
                role="option"
                aria-selected={selectedIndex === actualIndex}
              >
                <Search className="w-4 h-4 text-white/40" />
                <span className="flex-1">{suggestion}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
