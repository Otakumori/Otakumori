'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import GlassPanel from '../GlassPanel';
import { t } from '@/lib/microcopy';

type SearchResult = {
  id: string;
  type: 'product' | 'post' | 'game';
  title: string;
  description?: string;
  image?: string;
  url: string;
  price?: number;
  publishedAt?: string;
  category?: string;
};

type SearchInterfaceProps = {};

export default function SearchInterface({}: SearchInterfaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'posts' | 'games'>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('search-history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/search?q=${encodeURIComponent(searchQuery)}&type=${activeTab === 'all' ? '' : activeTab}`,
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add to search history
    const newHistory = [query, ...searchHistory.filter((h) => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('search-history', JSON.stringify(newHistory));

    // Update URL
    const params = new URLSearchParams();
    params.set('q', query);
    router.push(`/search?${params.toString()}`);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleTabChange = (tab: 'all' | 'products' | 'posts' | 'games') => {
    setActiveTab(tab);
    if (query) {
      performSearch(query);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search-history');
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'product':
        return '';
      case 'post':
        return '';
      case 'game':
        return '';
      default:
        return '⌕';
    }
  };

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'product':
        return 'text-blue-400';
      case 'post':
        return 'text-green-400';
      case 'game':
        return 'text-purple-400';
      default:
        return 'text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <GlassPanel className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              name="q"
              aria-label="Search"
              value={query}
              onChange={handleQueryChange}
              placeholder={t('search', 'placeholder')}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-zinc-400 focus:border-fuchsia-400 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
            >
              ⌕
            </button>
          </div>

          {/* Search Tabs */}
          <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'products', label: 'Products' },
              { id: 'posts', label: 'Posts' },
              { id: 'games', label: 'Games' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-fuchsia-500/90 text-white'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </form>
      </GlassPanel>

      {/* Search History */}
      {searchHistory.length > 0 && !query && (
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Searches</h3>
            <button
              onClick={clearHistory}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term, index) => (
              <button
                key={index}
                onClick={() => setQuery(term)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* Search Results */}
      {query && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto mb-4"></div>
              <p className="text-zinc-400">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                </h3>
              </div>

              {results.map((result) => (
                <GlassPanel key={`${result.type}-${result.id}`} className="p-4">
                  <Link href={result.url} className="block">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {result.image ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={result.image}
                              alt={result.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center">
                            <span className="text-2xl">{getResultIcon(result.type)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-semibold text-white truncate">
                            {result.title}
                          </h4>
                          <span
                            className={`text-xs font-medium ${getResultTypeColor(result.type)}`}
                          >
                            {result.type.toUpperCase()}
                          </span>
                        </div>

                        {result.description && (
                          <p className="text-sm text-zinc-300 mb-2 line-clamp-2">
                            {result.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-zinc-400">
                          {result.price && (
                            <span className="text-fuchsia-300 font-semibold">${result.price}</span>
                          )}
                          {result.publishedAt && (
                            <span>{new Date(result.publishedAt).toLocaleDateString()}</span>
                          )}
                          {result.category && <span>{result.category}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </GlassPanel>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <GlassPanel className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">No results found</h3>
                <p className="text-zinc-400 mb-4">
                  Try searching for something else or check your spelling
                </p>
                <div className="text-sm text-zinc-500">
                  <p>Suggestions:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Try different keywords</li>
                    <li>• Check your spelling</li>
                    <li>• Use more general terms</li>
                  </ul>
                </div>
              </GlassPanel>
            </div>
          )}
        </div>
      )}

      {/* No Search Query */}
      {!query && (
        <div className="text-center py-12">
          <GlassPanel className="p-8">
            <h3 className="text-xl font-semibold text-white mb-4">{t('search', 'suggesting')}</h3>
            <p className="text-zinc-400">
              Search for products, blog posts, or games to get started
            </p>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
