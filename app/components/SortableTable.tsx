"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type SortDirection = "asc" | "desc";

type TableRow = Record<string, unknown>;

interface Column<T extends TableRow> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface SortableTableProps<T extends TableRow> {
  data: T[];
  columns: Column<T>[];
  defaultSort?: {
    key: keyof T;
    direction: SortDirection;
  };
  onSort?: (sorted: T[]) => void;
}

export function SortableTable<T extends TableRow>({
  data,
  columns,
  defaultSort,
  onSort,
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(
    defaultSort?.key ?? null
  );

  const [sortDirection, setSortDirection] =
    useState<SortDirection>(defaultSort?.direction ?? "asc");

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue == null) return sortDirection === "asc" ? 1 : -1;
      if (bValue == null) return sortDirection === "asc" ? -1 : 1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortDirection === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [data, sortKey, sortDirection]);

  useEffect(() => {
    onSort?.(sortedData);
  }, [sortedData, onSort]);

  function handleSort(key: keyof T) {
    if (sortKey === key) {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-700">
      <table className="w-full border-collapse">
        <thead className="border-b border-zinc-700 bg-zinc-800">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-4 py-3 text-left text-sm font-semibold text-zinc-300"
              >
                {column.sortable !== false ? (
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className="group flex w-full items-center gap-2 transition-colors hover:text-white"
                  >
                    <span>{column.label}</span>

                    {sortKey === column.key ? (
                      sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )
                    ) : (
                      <ChevronUp className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-30" />
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
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-zinc-500"
              >
                No data available.
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr
                key={
                  String(
                    row.id ??
                      row._id ??
                      row.uuid ??
                      index
                  )
                }
                className="border-b border-zinc-700 transition-colors hover:bg-zinc-800/50"
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="whitespace-nowrap px-4 py-3 text-sm text-zinc-300"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}