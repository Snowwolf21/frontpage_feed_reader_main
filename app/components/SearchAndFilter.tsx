"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { Search, X } from "lucide-react";
import type { NormalizedItem } from "@/types/feed";

interface SearchAndFilterProps {
  items: NormalizedItem[];
  searchFields?: (keyof NormalizedItem)[];
  onFilter?: (filtered: NormalizedItem[]) => void;
  placeholder?: string;
}

export function SearchAndFilter({
  items,
  // 1. FIXED: Replaced "description" with "summary" to match your interface
  searchFields = ["title", "summary"], 
  onFilter,
  placeholder = "Search...",
}: SearchAndFilterProps) {

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const normalizedSearch = searchTerm.trim().toLowerCase();

  // 2. FIXED: Extracts actual strings from the item.categories array
  const categories = useMemo(() => {
    return Array.from(
      new Set(
        items
          .flatMap((item) => item.categories)
          .filter((category): category is string => Boolean(category))
      )
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        normalizedSearch === "" ||
        searchFields.some((field) =>
          String(item[field] ?? "")
            .toLowerCase()
            .includes(normalizedSearch)
        );

      // 3. FIXED: Checks if the selected category is inside the item's categories array
      const matchesCategory =
        selectedCategory === "" || 
        item.categories.includes(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [
    items,
    normalizedSearch,
    selectedCategory,
    searchFields,
  ]);

  useEffect(() => {
    onFilter?.(filteredItems);
  }, [filteredItems, onFilter]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
  }, []);

  const isFiltered = normalizedSearch !== "" || selectedCategory !== "";

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

        <input
          type="text"
          name="searchInput"
          id="searchInput"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          aria-label="SearchInput"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {searchTerm && (
          <button
            onClick={handleClearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filters */}
      {categories.length > 0 && (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Category
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("")}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selectedCategory === ""
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                }`}
              >
                All
              </button>

              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    selectedCategory === category
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {isFiltered && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-400 underline hover:text-blue-300"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-zinc-400">
        Showing{" "}
        <span className="font-semibold text-zinc-300">
          {filteredItems.length}
        </span>{" "}
        of {items.length} item{items.length !== 1 ? "s" : ""}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-6 text-center text-zinc-400">
          No matching items found.
        </div>
      )}
    </div>
  );
}
