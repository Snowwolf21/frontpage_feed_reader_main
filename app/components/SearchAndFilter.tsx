"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, X } from "lucide-react";

interface SearchAndFilterProps {
  items: any[];
  searchFields?: string[];
  onFilter?: (filtered: any[]) => void;
  placeholder?: string;
}

export function SearchAndFilter({
  items,
  searchFields = ['title', 'description'],
  onFilter,
  placeholder = 'Search...',
}: SearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Memoized filtered results
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Text search
      const matchesSearch = searchTerm === '' ||
        searchFields.some((field) =>
          String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Category filter
      const matchesCategory = selectedCategory === '' ||
        item.category === selectedCategory;

      // Tags filter
      const matchesTags = selectedTags.length === 0 ||
        (Array.isArray(item.tags) &&
          selectedTags.some((tag) => item.tags.includes(tag)));

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [items, searchTerm, selectedTags, selectedCategory, searchFields]);

  // Extract unique categories and tags from items
  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))],
    [items]
  );

  const allTags = useMemo(
    () => [
      ...new Set(
        items
          .flatMap((item) => item.tags || [])
          .filter(Boolean)
      ),
    ],
    [items]
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedTags([]);
    setSelectedCategory('');
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const isFiltered = searchTerm !== '' || selectedTags.length > 0 || selectedCategory !== '';

  // Trigger callback when filters change
  React.useEffect(() => {
    onFilter?.(filteredItems);
  }, [filteredItems, onFilter]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filters */}
      {(categories.length > 0 || allTags.length > 0) && (
        <div className="space-y-4">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Category
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === ''
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 flex-wrap">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-500 text-white'
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-zinc-400">
        {isFiltered && (
          <span>
            Found <span className="font-semibold text-zinc-300">{filteredItems.length}</span> result
            {filteredItems.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
