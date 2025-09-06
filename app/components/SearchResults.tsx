'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, User, Package, MessageSquare, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { type SearchRequest, type SearchResponse, type SearchResult } from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';

interface SearchResultsProps {
  query: string;
  searchType: 'all' | 'people' | 'content' | 'products';
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export default function SearchResults({
  query,
  searchType,
  onResultClick,
  className = '',
}: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);

  const performSearch = useCallback(
    async (searchQuery: string, searchOffset: number = 0, reset: boolean = false) => {
      try {
        setIsLoading(true);

        const request: SearchRequest = {
          query: searchQuery,
          searchType,
          limit: 20,
          offset: searchOffset,
        };

        const response = await fetch('/api/v1/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });

        if (response.ok) {
          const data: { ok: boolean; data: SearchResponse } = await response.json();
          if (data.ok) {
            if (reset) {
              setResults(data.data.results);
              setOffset(20);
            } else {
              setResults((prev) => [...prev, ...data.data.results]);
              setOffset((prev) => prev + 20);
            }
            setHasMore(data.data.hasMore);
            setTotalCount(data.data.totalCount);
          }
        }
      } catch (error) {
        logger.error('Search failed', {
          extra: { error: error instanceof Error ? error.message : 'Unknown error' },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [searchType],
  );

  useEffect(() => {
    if (query.trim()) {
      performSearch(query, 0, true);
    }
  }, [query, performSearch]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      performSearch(query, offset, false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Track analytics
    trackSearchClick(result);

    if (onResultClick) {
      onResultClick(result);
    } else {
      // Default behavior: navigate to result URL
      window.location.href = result.url;
    }
  };

  const trackSearchClick = async (result: SearchResult) => {
    try {
      await fetch('/api/v1/search/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          searchType,
          resultCount: totalCount,
          clickedResultId: result.id,
          clickedResultType: result.type,
          sessionId: Date.now().toString(),
        }),
      });
    } catch (error) {
      logger.warn('Failed to track search click', {
        extra: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'party':
        return <Users className="h-4 w-4" />;
      case 'activity':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getResultTypeColor = (type: string) => {
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

  if (!query.trim()) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Search Otakumori</h3>
        <p className="text-gray-500">Find people, products, and content across the platform</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Search Results for "{query}"</h2>
        <p className="text-gray-600">
          {totalCount > 0 ? `${totalCount} results found` : 'No results found'}
        </p>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={`${result.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleResultClick(result)}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getResultTypeColor(result.type)}`}>
                  {getResultIcon(result.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">{result.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getResultTypeColor(result.type)}`}
                    >
                      {result.type}
                    </span>
                  </div>

                  {result.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{result.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="truncate">{result.url}</span>
                    {result.relevanceScore && (
                      <span>Relevance: {Math.round(result.relevanceScore)}%</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* No Results */}
      {!isLoading && results.length === 0 && query.trim() && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500">Try adjusting your search terms or search type</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && results.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Searching...</p>
        </div>
      )}
    </div>
  );
}
