'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/app/components/SearchBar';
import SearchResults from '@/app/components/SearchResults';
import { type SearchResult } from '@/app/lib/contracts';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'people' | 'content' | 'products'>('all');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlType = searchParams.get('type') as 'all' | 'people' | 'content' | 'products';

    if (urlQuery) {
      setQuery(urlQuery);
    }
    if (urlType && ['all', 'people', 'content', 'products'].includes(urlType)) {
      setSearchType(urlType);
    }
  }, [searchParams]);

  const handleSearch = (
    searchQuery: string,
    type: 'all' | 'people' | 'content' | 'products' = searchType,
  ) => {
    setQuery(searchQuery);
    setSearchType(type);

    // Update URL
    const params = new URLSearchParams();
    params.set('q', searchQuery);
    params.set('type', type);
    router.push(`/search?${params.toString()}`);
  };

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the result URL
    router.push(result.url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Otakumori</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover people, products, and content across the platform. Find your next favorite
            creator, product, or community.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar
            placeholder="Search people, products, content..."
            onResultClick={handleResultClick}
            className="w-full"
          />
        </div>

        {/* Search Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
            {(['all', 'people', 'content', 'products'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleSearch(query, type)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  searchType === type ? 'bg-pink-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {query && (
          <SearchResults
            query={query}
            searchType={searchType}
            onResultClick={handleResultClick}
            className="max-w-4xl mx-auto"
          />
        )}

        {/* Search Tips */}
        {!query && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Tips</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">People Search</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Search by username or display name</li>
                    <li>• Find creators and community members</li>
                    <li>• View public profiles and activities</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Product Search</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Search by product name or description</li>
                    <li>• Filter by tags and categories</li>
                    <li>• Find merchandise and collectibles</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Content Search</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Search comments and discussions</li>
                    <li>• Find activities and achievements</li>
                    <li>• Discover community content</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Advanced Search</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use quotes for exact phrases</li>
                    <li>• Combine multiple search terms</li>
                    <li>• Filter by date and content type</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
