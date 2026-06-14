"use client";

import { useState, useCallback, useMemo } from "react";
import { Calendar, TrendingUp } from "lucide-react";

type FilterType = 'dateRange' | 'readStatus' | 'author' | 'custom';

interface FilterConfig {
  type: FilterType;
  label: string;
  value: any;
}

interface AdvancedFilterProps {
  items: any[];
  onFilter?: (filtered: any[]) => void;
  filterConfigs?: FilterConfig[];
}

export function AdvancedFilter({
  items,
  onFilter,
  filterConfigs = [],
}: AdvancedFilterProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Date range filter
      if (activeFilters.dateFrom || activeFilters.dateTo) {
        const itemDate = new Date(item.date);
        if (activeFilters.dateFrom && itemDate < new Date(activeFilters.dateFrom)) {
          return false;
        }
        if (activeFilters.dateTo && itemDate > new Date(activeFilters.dateTo)) {
          return false;
        }
      }

      // Read status filter
      if (activeFilters.readStatus && item.isRead !== activeFilters.readStatus) {
        return false;
      }

      // Author filter
      if (activeFilters.author && item.author !== activeFilters.author) {
        return false;
      }

      return true;
    });
  }, [items, activeFilters]);

  const handleFilterChange = useCallback((key: string, value: any) => {
    setActiveFilters((prev) => {
      const updated = { ...prev, [key]: value };
      if (!value) {
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
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={activeFilters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={activeFilters.dateTo || ''}
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
                onClick={() =>
                  handleFilterChange('readStatus', activeFilters.readStatus === 'all' ? null : 'all')
                }
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilters.readStatus === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() =>
                  handleFilterChange('readStatus', activeFilters.readStatus === true ? null : true)
                }
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilters.readStatus === true
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                Read
              </button>
              <button
                onClick={() =>
                  handleFilterChange('readStatus', activeFilters.readStatus === false ? null : false)
                }
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
