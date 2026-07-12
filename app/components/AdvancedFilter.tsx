"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { NormalizedItem } from "@/types/feed";

type FilterType = 'dateRange' | 'readStatus' | 'author' | 'custom';

export interface FilterConfig {
  type: FilterType;
  label: string;
  value: string; // The property key on the feed item (e.g., 'category' or 'source')
  options?: Array<{ label: string; value: string }>; // Optional drop-down choices
}

export interface FilterableItem extends NormalizedItem {
  date?: string | Date; 
  isRead?: boolean;
  [key: string]: unknown; // Allow dynamic key access for custom filters
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

  // 1. Data filtering logic incorporating custom configurations
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const rawDate = item.date || item.pubDate;
      
      // Date filtering
      if ((activeFilters.dateFrom || activeFilters.dateTo) && rawDate) {
        const itemTime = new Date(rawDate).getTime();
        if (activeFilters.dateFrom && itemTime < new Date(String(activeFilters.dateFrom)).getTime()) return false;
        if (activeFilters.dateTo && itemTime > new Date(String(activeFilters.dateTo)).getTime()) return false;
      }

      // Read status filtering
      if (Object.prototype.hasOwnProperty.call(activeFilters, 'readStatus') && item.isRead !== activeFilters.readStatus) {
        return false;
      }

      // Author filtering
      if (activeFilters.author && item.author !== activeFilters.author) {
        return false;
      }

      // Dynamic evaluation of custom filters passed via configs
      for (const config of filterConfigs) {
        if (config.type === 'custom' || config.type === 'author') {
          const selectedValue = activeFilters[config.value];
          if (selectedValue && String(item[config.value]) !== String(selectedValue)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [items, activeFilters, filterConfigs]);

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

  useEffect(() => {
    onFilter?.(filteredItems);
  }, [filteredItems, onFilter]);

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Advanced Filters</span>
        {hasActiveFilters && (
          <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full">
            {Object.keys(activeFilters).length}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg space-y-4">
          {/* Date Range Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-zinc-300 mb-2">From Date</label>
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
              <label htmlFor="dateTo" className="block text-sm font-medium text-zinc-300 mb-2">To Date</label>
              <input
                id="dateTo"
                name="dateTo"
                type="date"
                value={String(activeFilters.dateTo || '')}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Read Status Selector */}
          <div>
            <span className="block text-sm font-medium text-zinc-300 mb-2">Read Status</span>
            <div className="flex gap-2">
              {(['all', true, false] as const).map((status) => {
                const isAll = status === 'all';
                const isActive = isAll 
                  ? !Object.prototype.hasOwnProperty.call(activeFilters, 'readStatus')
                  : activeFilters.readStatus === status;

                return (
                  <button
                    key={String(status)}
                    type="button"
                    onClick={() => handleFilterChange('readStatus', isAll ? '' : status)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? 'bg-blue-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    {isAll ? 'All' : status ? 'Read' : 'Unread'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Dynamic Custom Filters UI generated from filterConfigs */}
          {filterConfigs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-700">
              {filterConfigs.map((config) => (
                <div key={config.value}>
                  <label htmlFor={`filter-${config.value}`} className="block text-sm font-medium text-zinc-300 mb-2">
                    {config.label}
                  </label>
                  {config.options ? (
                    <select
                      id={`filter-${config.value}`}
                      value={String(activeFilters[config.value] || '')}
                      onChange={(e) => handleFilterChange(config.value, e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All {config.label}s</option>
                      {config.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`filter-${config.value}`}
                      type="text"
                      placeholder={`Search ${config.label}...`}
                      value={String(activeFilters[config.value] || '')}
                      onChange={(e) => handleFilterChange(config.value, e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Active Filter Clear Action */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-zinc-700">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-blue-400 hover:text-blue-300 underline focus:outline-none"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
