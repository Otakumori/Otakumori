"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Search, TrendingUp, X } from "lucide-react";
import {
  type ApiEnvelope,
  type SearchRequest,
  type SearchResult,
  type SearchResponse,
  type SearchSuggestionRequest,
  type SearchSuggestionResponse,
} from "@/app/lib/contracts";
import { cn } from "@/lib/utils";

const HISTORY_LIMIT = 5;
const SUGGESTION_LIMIT = 5;

type SearchType = SearchRequest["searchType"];

type SearchSuggestion = SearchSuggestionResponse["suggestions"][number];

type SearchHistoryPayload = {
  history: Array<{ query: string }>;
};

interface SearchBarProps {
  placeholder?: string;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

async function getLogger() {
  const { logger } = await import("@/app/lib/logger");
  return logger;
}

export default function SearchBar({
  placeholder = "What're ya Buyin'?",
  onResultClick,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const suggestionAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    void loadRecentSearches();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current || !event.target) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadRecentSearches = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/search/history?limit=${HISTORY_LIMIT}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`History request failed (${response.status})`);
      }

      const payload: ApiEnvelope<SearchHistoryPayload> = await response.json();
      if (payload.ok) {
        setRecentSearches(payload.data.history.map((item) => item.query));
      }
    } catch (error) {
      const logger = await getLogger();
      logger.warn("Failed to load recent searches", {
        extra: { error: error instanceof Error ? error.message : String(error) },
      });
    }
  }, []);

  const fetchSuggestions = useCallback(
    async (rawQuery: string, type: SearchType) => {
      suggestionAbortRef.current?.abort();
      const controller = new AbortController();
      suggestionAbortRef.current = controller;

      try {
        setIsLoading(true);

        const requestBody: SearchSuggestionRequest = {
          query: rawQuery,
          searchType: type,
          limit: SUGGESTION_LIMIT,
        };

        const response = await fetch("/api/v1/search/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Suggestion request failed (${response.status})`);
        }

        const payload: ApiEnvelope<SearchSuggestionResponse> = await response.json();
        if (payload.ok) {
          setSuggestions(payload.data.suggestions);
          setIsOpen(true);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        const logger = await getLogger();
        logger.warn("Failed to fetch search suggestions", {
          extra: { error: error instanceof Error ? error.message : String(error) },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleSearch = useCallback(
    async (rawQuery?: string) => {
      const normalizedQuery = (rawQuery ?? query).trim();
      if (!normalizedQuery) {
        return;
      }

      setIsOpen(false);
      setIsLoading(true);

      setRecentSearches((prev) => {
        const deduped = prev.filter((item) => item !== normalizedQuery);
        return [normalizedQuery, ...deduped].slice(0, HISTORY_LIMIT);
      });

      if (onResultClick) {
        try {
          const requestBody: SearchRequest = {
            query: normalizedQuery,
            searchType,
            limit: 20,
            offset: 0,
          };

          const response = await fetch("/api/v1/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error(`Search request failed (${response.status})`);
          }

          const payload: ApiEnvelope<SearchResponse> = await response.json();
          if (payload.ok && payload.data.results.length > 0) {
            onResultClick(payload.data.results[0]);
          }
        } catch (error) {
          const logger = await getLogger();
          logger.error("Search request failed", {
            extra: { error: error instanceof Error ? error.message : String(error) },
          });
        } finally {
          setIsLoading(false);
        }
        return;
      }

      const params = new URLSearchParams();
      params.set("q", normalizedQuery);
      if (searchType !== "all") {
        params.set("type", searchType);
      }

      router.push(`/search?${params.toString()}`);
      setIsLoading(false);
    },
    [onResultClick, query, router, searchType],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (!value.trim()) {
        setSuggestions([]);
        setIsOpen(recentSearches.length > 0);
        suggestionAbortRef.current?.abort();
        return;
      }

      void fetchSuggestions(value, searchType);
    },
    [fetchSuggestions, recentSearches.length, searchType],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      void handleSearch();
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      suggestionAbortRef.current?.abort();
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    suggestionAbortRef.current?.abort();
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.query);
    void handleSearch(suggestion.query);
  };

  const handleHistoryClick = (value: string) => {
    setQuery(value);
    void handleSearch(value);
  };

  const dropdownItemsAvailable = suggestions.length > 0 || recentSearches.length > 0;

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-white/60" aria-hidden="true" />
        </div>

        <input
          ref={inputRef}
          type="text"
          name="q"
          aria-label="Search"
          value={query}
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(dropdownItemsAvailable)}
          placeholder={placeholder}
          className="glass-card-dark w-full rounded-lg border border-white/20 py-2 pl-10 pr-10 text-white placeholder:text-white/60 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-200"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-pink-500" aria-label="Loading" />
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-1">
        {( ["all", "people", "content", "products"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setSearchType(type);
              if (query.trim()) {
                void fetchSuggestions(query, type);
              }
            }}
            className={cn(
              "rounded-full px-3 py-1 text-xs transition-colors",
              searchType === type
                ? "bg-pink-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300",
            )}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isOpen && dropdownItemsAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="border-b border-gray-100 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  Recent searches
                </div>
                {recentSearches.map((recent) => (
                  <button
                    key={recent}
                    type="button"
                    onClick={() => handleHistoryClick(recent)}
                    className="w-full rounded px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {recent}
                  </button>
                ))}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="p-3">
                <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  Suggestions
                </div>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600">
                      {suggestion.suggestionType}
                    </span>
                    <span className="flex-1 truncate">{suggestion.query}</span>
                  </button>
                ))}
              </div>
            )}

            {query.trim().length > 0 && suggestions.length === 0 && !isLoading && (
              <div className="p-3 text-center text-sm text-gray-500">
                No suggestions found for &quot;{query}&quot;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
