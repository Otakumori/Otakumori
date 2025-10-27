'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Gamepad2, Search, ShoppingBag, Trash2 } from 'lucide-react';
import GlassPanel from '../GlassPanel';
import {
  type ApiEnvelope,
  type SearchRequest,
  type SearchResponse,
  type SearchResult,
} from '@/app/lib/contracts';
import { t } from '@/lib/microcopy';
import { cn } from '@/lib/utils';

const HISTORY_STORAGE_KEY = 'search-history';
const HISTORY_LIMIT = 10;

const TAB_TO_SEARCH_TYPE: Record<TabKey, SearchRequest['searchType']> = {
  all: 'all',
  products: 'products',
  posts: 'content',
  games: 'content',
};

type TabKey = 'all' | 'products' | 'posts' | 'games';

type ExtendedResult = {
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

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

function deriveExtendedType(result: SearchResult): ExtendedResult['type'] {
  if (result.type === 'product') {
    return 'product';
  }

  const metadata = (result.metadata ?? {}) as Record<string, unknown>;
  const category = metadata['category'];
  if (category === 'game' || category === 'mini_game' || result.type === 'activity') {
    return 'game';
  }

  return 'post';
}

function mapResult(result: SearchResult): ExtendedResult {
  const metadata = (result.metadata ?? {}) as Record<string, unknown>;
  const imageCandidate = metadata['image'] ?? metadata['imageUrl'] ?? metadata['thumbnail'];
  const priceCandidate = metadata['price'] ?? metadata['priceCents'];
  const publishedCandidate = metadata['publishedAt'] ?? metadata['createdAt'];

  const priceValue = typeof priceCandidate === 'number' ? priceCandidate : undefined;
  const normalizedPrice =
    typeof priceValue === 'number' && priceValue > 1_000 ? priceValue / 100 : priceValue;

  const extendedResult: any = {
    id: result.id,
    type: deriveExtendedType(result),
    title: result.title,
    url: result.url,
  };
  if (result.description !== undefined) extendedResult.description = result.description;
  if (typeof imageCandidate === 'string') extendedResult.image = imageCandidate;
  if (normalizedPrice !== undefined) extendedResult.price = normalizedPrice;
  if (typeof publishedCandidate === 'string') extendedResult.publishedAt = publishedCandidate;
  if (typeof metadata['category'] === 'string') extendedResult.category = metadata['category'];
  return extendedResult;
}

export default function SearchInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [results, setResults] = useState<ExtendedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const savedHistory =
      typeof window !== 'undefined' ? window.localStorage.getItem(HISTORY_STORAGE_KEY) : null;
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
          setSearchHistory(parsed);
        }
      } catch (err) {
        void getLogger().then((logger) =>
          logger.warn('Failed to parse search history', {
            extra: { error: err instanceof Error ? err.message : String(err) },
          }),
        );
      }
    }
  }, []);

  useEffect(() => {
    const paramQuery = searchParams.get('q') ?? '';
    setQuery(paramQuery);
    setActiveQuery(paramQuery);
  }, [searchParams]);

  const filteredResults = useMemo(() => {
    if (activeTab === 'all') {
      return results;
    }

    return results.filter((result) => {
      if (activeTab === 'products') {
        return result.type === 'product';
      }

      if (activeTab === 'games') {
        return result.type === 'game';
      }

      return result.type === 'post';
    });
  }, [activeTab, results]);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) {
        setResults([]);
        setError(null);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setIsLoading(true);
        setError(null);

        const requestBody: SearchRequest = {
          query: trimmedQuery,
          searchType: TAB_TO_SEARCH_TYPE[activeTab],
          limit: 20,
          offset: 0,
        };

        const response = await fetch('/api/v1/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Search request failed (${response.status})`);
        }

        const payload: ApiEnvelope<SearchResponse> = await response.json();
        if (!payload.ok) {
          throw new Error(payload.error);
        }

        const mapped = payload.data.results.map(mapResult);
        setResults(mapped);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        const logger = await getLogger();
        logger.error('Search interface query failed', { extra: { error: message } });
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    if (activeQuery) {
      void performSearch(activeQuery);
    } else {
      setResults([]);
      setError(null);
    }

    return () => {
      abortRef.current?.abort();
    };
  }, [activeQuery, performSearch]);

  const updateHistory = useCallback((value: string) => {
    setSearchHistory((prev) => {
      const deduped = prev.filter((entry) => entry !== value);
      const next = [value, ...deduped].slice(0, HISTORY_LIMIT);
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalized = query.trim();
    if (!normalized) {
      return;
    }

    setActiveQuery(normalized);
    updateHistory(normalized);

    const params = new URLSearchParams();
    params.set('q', normalized);
    params.set('type', activeTab);
    router.push(`/search?${params.toString()}`);
  };

  const handleHistorySelect = (value: string) => {
    setQuery(value);
    setActiveQuery(value);
    updateHistory(value);

    const params = new URLSearchParams();
    params.set('q', value);
    params.set('type', activeTab);
    router.push(`/search?${params.toString()}`);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  const historyVisible = searchHistory.length > 0;
  const hasResults = filteredResults.length > 0;

  return (
    <div className="space-y-6">
      <GlassPanel className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="search-query" className="block text-sm font-medium text-white/80">
            {t('search', 'label') ?? 'Search'}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
              <Search className="h-5 w-5" aria-hidden="true" />
            </span>
            <input
              id="search-query"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('search', 'placeholder') ?? 'Find something magical'}
              className="w-full rounded-lg border border-white/10 bg-white/10 py-3 pl-11 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              autoComplete="off"
            />
          </div>

          <div className="flex gap-2 text-sm">
            {(['all', 'products', 'posts', 'games'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-full px-4 py-2 transition-colors',
                  activeTab === tab
                    ? 'bg-fuchsia-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20',
                )}
                aria-pressed={activeTab === tab}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-fuchsia-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-fuchsia-600"
          >
            Search
          </button>
        </form>
      </GlassPanel>

      {historyVisible && (
        <GlassPanel className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-white/80">Recent searches</span>
            <button
              type="button"
              onClick={clearHistory}
              className="flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-white"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleHistorySelect(term)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {term}
              </button>
            ))}
          </div>
        </GlassPanel>
      )}

      {activeQuery && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-12 text-center">
              <div
                className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-fuchsia-500"
                aria-label="Loading"
              />
              <p className="text-zinc-400">Searching...</p>
            </div>
          ) : error ? (
            <GlassPanel className="p-6 text-sm text-amber-300">{error}</GlassPanel>
          ) : hasResults ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {filteredResults.length} result{filteredResults.length === 1 ? '' : 's'} for "
                  {activeQuery}"
                </h3>
              </div>

              {filteredResults.map((result) => (
                <GlassPanel key={`${result.type}-${result.id}`} className="p-4">
                  <Link href={result.url} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {result.image ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                          <Image
                            src={result.image}
                            alt={result.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 text-fuchsia-300">
                          {result.type === 'product' ? (
                            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
                          ) : result.type === 'game' ? (
                            <Gamepad2 className="h-6 w-6" aria-hidden="true" />
                          ) : (
                            <Search className="h-6 w-6" aria-hidden="true" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="truncate text-lg font-semibold text-white">
                          {result.title}
                        </h4>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                          {result.type.toUpperCase()}
                        </span>
                      </div>

                      {result.description && (
                        <p className="mb-2 line-clamp-2 text-sm text-zinc-300">
                          {result.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                        {typeof result.price === 'number' && (
                          <span className="font-semibold text-fuchsia-300">
                            ${result.price.toFixed(2)}
                          </span>
                        )}
                        {result.publishedAt && (
                          <span>{new Date(result.publishedAt).toLocaleDateString()}</span>
                        )}
                        {result.category && <span>{result.category}</span>}
                      </div>
                    </div>
                  </Link>
                </GlassPanel>
              ))}
            </div>
          ) : (
            <GlassPanel className="p-8 text-center">
              <h3 className="mb-4 text-xl font-semibold text-white">No results found</h3>
              <p className="text-zinc-400">
                Try searching for something else or check your spelling.
              </p>
              <ul className="mt-4 space-y-1 text-sm text-zinc-500">
                <li>- Try different keywords</li>
                <li>- Check your spelling</li>
                <li>- Use more general terms</li>
              </ul>
            </GlassPanel>
          )}
        </div>
      )}

      {!activeQuery && (
        <GlassPanel className="p-8 text-center">
          <h3 className="mb-4 text-xl font-semibold text-white">{t('search', 'suggesting')}</h3>
          <p className="text-zinc-400">Search for products, blog posts, or games to get started.</p>
        </GlassPanel>
      )}
    </div>
  );
}
