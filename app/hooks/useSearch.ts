"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  SearchIndex,
  type SearchIndexItem,
} from "@/app/lib/searchIndex";

interface UseSearchOptions {
  fuzzy?: boolean;
  limit?: number;
  debounce?: number;
}

export function useSearch(
  documents: SearchIndexItem[],
  options: UseSearchOptions = {}
) {
  const {
    fuzzy = false,
    limit = 50,
    debounce = 150,
  } = options;

  const [results, setResults] = useState<SearchIndexItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Build the search index only when documents change.
   */
  const searchIndex = useMemo(() => {
    const index = new SearchIndex();
    index.addDocuments(documents);
    return index;
  }, [documents]);

  /**
   * Cancel pending searches when component unmounts.
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const search = useCallback(
    (query: string) => {
      const value = query.trim();

      if (!value) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsSearching(true);

      timeoutRef.current = setTimeout(() => {
        const matches = fuzzy
          ? searchIndex.fuzzySearch(value, limit)
          : searchIndex.search(value, limit);

        setResults(matches);
        setIsSearching(false);
      }, debounce);
    },
    [searchIndex, fuzzy, limit, debounce]
  );

  const clearResults = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setResults([]);
    setIsSearching(false);
  }, []);

  return {
    results,
    isSearching,
    search,
    clearResults,
  };
}