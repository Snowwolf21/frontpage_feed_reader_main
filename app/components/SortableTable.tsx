"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

type SortDirection = 'asc' | 'desc';

interface SortOption {
  label: string;
  value: string;
  direction?: SortDirection;
}

interface SortableTableProps {
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  defaultSort?: { key: string; direction: SortDirection };
  onSort?: (sorted: any[]) => void;
}

export function SortableTable({
  data,
  columns,
  defaultSort,
  onSort,
}: SortableTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    defaultSort?.direction || 'asc'
  );

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    onSort?.(sorted);
    return sorted;
  }, [data, sortKey, sortDirection, onSort]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-700">
      <table className="w-full">
        <thead className="bg-zinc-800 border-b border-zinc-700">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-sm font-semibold text-zinc-300"
              >
                {column.sortable !== false ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    {column.label}
                    {sortKey === column.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-zinc-700 hover:bg-zinc-800/50 transition-colors"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm text-zinc-300">
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
