"use client";

import React, { useState, useCallback, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import type { NormalizedItem } from "@/types/feed";

type FilterType = 'dateRange' | 'readStatus' | 'author' | 'custom';

interface FilterConfig {
  type: FilterType;
  label: string;
  value: string;
}

export interface FilterableItem extends NormalizedItem {
  date?: string | Date; 
  isRead?: boolean;
}

interface AdvancedFilterProps {
  items: FilterableItem[];
  onFilter?: (filtered: FilterableItem[]) => void;
  filterConfigs?: FilterConfig[];
}

type FilterValue = string | boolean | null | undefined;
type FilterState = Record<string, FilterValue>;

export function AdvancedFilter({
  items,
  onFilter,
  filterConfigs = [],
}: AdvancedFilterProps) {
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const rawDate = item.date || item.pubDate;
      if ((activeFilters.dateFrom || activeFilters.dateTo) && rawDate) {
        const itemDate = new Date(rawDate);
        if (activeFilters.dateFrom && itemDate < new Date(String(activeFilters.dateFrom))) {
          return false;
        }
        if (activeFilters.dateTo && itemDate > new Date(String(activeFilters.dateTo))) {
          return false;
        }
      }

      if (
        activeFilters.readStatus !== undefined && 
        activeFilters.readStatus !== "" && 
        item.isRead !== activeFilters.readStatus
      ) {
        return false;
      }

      if (activeFilters.author && item.author !== activeFilters.author) {
        return false;
      }

      return true;
    });
  }, [items, activeFilters]);

  // FIXED: Changed parameter type from "any" to "FilterValue"
  const handleFilterChange = useCallback((key: string, value: FilterValue) => {
    setActiveFilters((prev) => {
      const updated = { ...prev, [key]: value };
      if (value === null || value === undefined || value === "") {
        delete updated[key];
      }
      return updated;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  React.useEffect(() => {
    onFilter?.(filteredItems);
  }, [filteredItems, onFilter]);

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors text-zinc-300"
      >
        <TrendingUp className="w-4 h-4" />
        Advanced Filters
        {hasActiveFilters && (
          <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
            {Object.keys(activeFilters).length}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg space-y-4">
          {/* Date Range Filter */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label  htmlFor="dateFrom" className="block text-sm font-medium text-zinc-300 mb-2">
                From Date
              </label>
              <input
              id="dateFrom"
              name="dateFrom"
                type="date"
                value={String(activeFilters.dateFrom || '')}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-zinc-300 mb-2">
                To Date
              </label>
              <input
              name="dateTo"
              id="dateTo"
                type="date"
                value={String(activeFilters.dateTo || '')}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Read Status Filter */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Read Status
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('readStatus', '')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  !Object.prototype.hasOwnProperty.call(activeFilters, 'readStatus') || activeFilters.readStatus === ''
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange('readStatus', true)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilters.readStatus === true
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                Read
              </button>
              <button
                onClick={() => handleFilterChange('readStatus', false)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilters.readStatus === false
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
