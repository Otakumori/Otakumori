'use client';

import { Skeleton } from '@/app/components/ui/Skeleton';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Gamepad2, Search, ShoppingBag, Trash2 } from 'lucide-react';
import {
  type ApiEnvelope,
  type SearchRequest,
  type SearchResponse,
  type SearchResult,
} from '@/app/lib/contracts';
import { cn } from '@/lib/utils';
import { EmptySearch } from '../empty-states/EmptySearch';
import { MoriSystemState } from '../mori/MoriProduction';

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
  const urlQuery = searchParams.get('q') ?? '';

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
    setQuery(urlQuery);
    setActiveQuery(urlQuery);
  }, [urlQuery]);

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
    <div className="discovery-search" data-results-active={activeQuery ? 'true' : 'false'}>
        <form onSubmit={handleSubmit} className="discovery-search__form om-search-form" role="search">
          <label htmlFor="search-query" className="sr-only">
            Search Otaku-mori
          </label>
          <div className="discovery-search__field">
            <span className="discovery-search__field-icon" aria-hidden="true">
              <Search className="h-5 w-5" aria-hidden="true" />
            </span>
            <input
              id="search-query"
              name="q"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What’re ya eyein’?"
              className="om-search-input discovery-search__input"
              autoComplete="off"
            />
          </div>

          <div className="om-search-filters discovery-search__filters" role="group" aria-label="Search types">
            {(['all', 'products', 'posts', 'games'] as const).map((tab) => {
              const isPressed = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={isPressed}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'om-search-filter discovery-search__filter',
                    isPressed && 'is-selected',
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            className="mori-button-primary discovery-search__submit"
          >
            Search
          </button>
        </form>

      {historyVisible && (
        <section className="om-search-history discovery-search__history" aria-label="Recent searches">
          <div className="discovery-search__history-heading">
            <h2>Recent searches</h2>
            <button
              type="button"
              onClick={clearHistory}
              className="discovery-search__clear"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          </div>
          <div className="discovery-search__history-list">
            {searchHistory.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleHistorySelect(term)}
                className="discovery-search__history-item"
              >
                {term}
              </button>
            ))}
          </div>
        </section>
      )}

      {activeQuery && (
        <section className="discovery-search__results" aria-label="Search results">
          {isLoading ? (
            <MoriSystemState
              state="loading"
              title="Searching the archive"
              description={`Looking for “${activeQuery}”.`}
            >
              <div className="discovery-search__skeleton" aria-hidden="true"><Skeleton /></div>
            </MoriSystemState>
          ) : error ? (
            <MoriSystemState
              state="error"
              title="Search is temporarily unavailable"
              description="Please try again in a moment."
            />
          ) : hasResults ? (
            <div className="discovery-results">
              <div className="discovery-results__heading" role="status" aria-live="polite">
                <h2>
                  {filteredResults.length} result{filteredResults.length === 1 ? '' : 's'} for "
                  {activeQuery}"
                </h2>
              </div>

              <ol className="discovery-results__list">
              {filteredResults.map((result) => (
                <li key={`${result.type}-${result.id}`} className="discovery-result">
                  <Link href={result.url} className="discovery-result__link">
                    <div className="discovery-result__media">
                      {result.image ? (
                        <div className="discovery-result__image">
                          <Image
                            src={result.image}
                            alt={result.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="discovery-result__fallback">
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

                    <div className="discovery-result__copy">
                      <div className="discovery-result__title-line">
                        <h3>
                          {result.title}
                        </h3>
                        <span className="discovery-result__type">
                          {result.type}
                        </span>
                      </div>

                      {result.description && (
                        <p className="discovery-result__description">
                          {result.description}
                        </p>
                      )}

                      <div className="discovery-result__meta">
                        {typeof result.price === 'number' && (
                          <span className="discovery-result__price">
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
                </li>
              ))}
              </ol>
            </div>
          ) : (
            <EmptySearch query={activeQuery} />
          )}
        </section>
      )}

      {!activeQuery && (
        <p className="om-search-hint discovery-search__hint">Begin with a name, title, or subject.</p>
      )}
    </div>
  );
}
