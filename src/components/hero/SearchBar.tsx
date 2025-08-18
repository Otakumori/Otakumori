'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { buildSearchPath } from '@/lib/search-utils';
import { search } from '../../../app/lib/brand-microcopy';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchPath = buildSearchPath(query.trim());
      router.push(searchPath);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={search.placeholder}
          className="w-full px-6 py-4 pl-14 text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
        />
        <SearchIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-white/60" />
        <button
          type="submit"
          className="w-full py-3 px-6 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Search
        </button>
      </div>
    </form>
  );
}
