"use client";

import { useState, useCallback } from "react";
import { SearchIndex, type SearchIndexItem } from "@/app/lib/searchIndex";

interface UseSearchOptions {
  fuzzy?: boolean;
  limit?: number;
}

export function useSearch(documents: SearchIndexItem[], options: UseSearchOptions = {}) {
  const { fuzzy = false, limit = 50 } = options;
  const [results, setResults] = useState<SearchIndexItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Create search index
  const searchIndex = new SearchIndex();
  searchIndex.addDocuments(documents);

  const search = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);

      // Simulate async search (in real app, could be server-side)
      setTimeout(() => {
        const searchResults = fuzzy
          ? searchIndex.fuzzySearch(query, limit)
          : searchIndex.search(query, limit);

        setResults(searchResults);
        setIsSearching(false);
      }, 100);
    },
    [fuzzy, limit, searchIndex]
  );

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    results,
    isSearching,
    search,
    clearResults,
  };
}
