'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Package, Search, User, Users } from 'lucide-react';
import {
  type ApiEnvelope,
  type SearchRequest,
  type SearchResponse,
  type SearchResult,
} from '@/app/lib/contracts';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

type SearchType = SearchRequest['searchType'];

type SearchAnalyticsPayload = {
  query: string;
  searchType: SearchType;
  resultCount: number;
  clickedResultId: string;
  clickedResultType: SearchResult['type'];
  sessionId?: string;
};

interface SearchResultsProps {
  query: string;
  searchType: SearchType;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

export default function SearchResults({
  query,
  searchType,
  onResultClick,
  className,
}: SearchResultsProps) {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const searchAbortRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(
    async (searchQuery: string, searchOffset = 0, reset = false) => {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) {
        setResults([]);
        setHasMore(false);
        setTotalCount(0);
        setOffset(0);
        setError(null);
        return;
      }

      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;

      try {
        setIsLoading(true);
        setError(null);

        const requestBody: SearchRequest = {
          query: trimmedQuery,
          searchType,
          limit: PAGE_SIZE,
          offset: searchOffset,
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

        if (reset) {
          setResults(payload.data.results);
          setOffset(
            payload.data.results.length >= PAGE_SIZE ? PAGE_SIZE : payload.data.results.length,
          );
        } else {
          setResults((prev) => [...prev, ...payload.data.results]);
          setOffset((prev) => prev + payload.data.results.length);
        }
        setHasMore(payload.data.hasMore);
        setTotalCount(payload.data.totalCount);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        const logger = await getLogger();
        logger.error('Search failed', { extra: { error: message } });
      } finally {
        setIsLoading(false);
      }
    },
    [searchType],
  );

  useEffect(() => {
    void performSearch(query, 0, true);
    return () => {
      searchAbortRef.current?.abort();
    };
  }, [performSearch, query]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      void performSearch(query, offset, false);
    }
  };

  const trackSearchClick = useCallback(
    async (result: SearchResult) => {
      try {
        const payload: SearchAnalyticsPayload = {
          query,
          searchType,
          resultCount: totalCount,
          clickedResultId: result.id,
          clickedResultType: result.type,
          sessionId: Date.now().toString(),
        };

        await fetch('/api/v1/search/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        const logger = await getLogger();
        logger.warn('Failed to track search click', {
          extra: { error: err instanceof Error ? err.message : String(err) },
        });
      }
    },
    [query, searchType, totalCount],
  );

  const handleResultClick = (result: SearchResult) => {
    void trackSearchClick(result);

    if (onResultClick) {
      onResultClick(result);
      return;
    }

    if (result.url) {
      router.push(result.url);
    }
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" aria-hidden="true" />;
      case 'product':
        return <Package className="h-4 w-4" aria-hidden="true" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" aria-hidden="true" />;
      case 'party':
        return <Users className="h-4 w-4" aria-hidden="true" />;
      case 'activity':
        return <Calendar className="h-4 w-4" aria-hidden="true" />;
      default:
        return <Search className="h-4 w-4" aria-hidden="true" />;
    }
  };

  const getResultTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'product':
        return 'bg-green-100 text-green-800';
      case 'comment':
        return 'bg-purple-100 text-purple-800';
      case 'party':
        return 'bg-orange-100 text-orange-800';
      case 'activity':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" aria-hidden="true" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">Search Otakumori</h3>
        <p className="text-gray-500">Find people, products, and content across the platform</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Search Results for &quot;{trimmedQuery}&quot;
        </h2>
        <p className="text-gray-600">
          {totalCount > 0 ? `${totalCount} results found` : 'No results found'}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={`${result.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleResultClick(result)}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className={cn('rounded-lg p-2', getResultTypeColor(result.type))}>
                  {getResultIcon(result.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="truncate font-medium text-gray-900">{result.title}</h3>
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 text-xs',
                        getResultTypeColor(result.type),
                      )}
                    >
                      {result.type}
                    </span>
                  </div>

                  {result.description && (
                    <p className="mb-2 line-clamp-2 text-sm text-gray-600">{result.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="truncate">{result.url}</span>
                    {typeof result.relevanceScore === 'number' && (
                      <span>Relevance: {Math.round(result.relevanceScore)}%</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-lg bg-pink-500 px-6 py-2 text-white transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {!isLoading && results.length === 0 && !error && (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" aria-hidden="true" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No results found</h3>
          <p className="text-gray-500">Try adjusting your search terms or search type</p>
        </div>
      )}

      {isLoading && results.length === 0 && (
        <div className="py-12 text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-pink-500"
            aria-label="Loading"
          />
          <p className="text-gray-500">Searching...</p>
        </div>
      )}
    </div>
  );
}
