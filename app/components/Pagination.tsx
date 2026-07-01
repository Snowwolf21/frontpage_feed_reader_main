"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NormalizedItem } from "@/types/feed";
import React from "react";

interface PaginationProps {
  items: NormalizedItem[];
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsChange?: (items: NormalizedItem[]) => void;
}

export function Pagination({
  items,
  itemsPerPage = 10,
  onPageChange,
  onItemsChange,
}: PaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    onPageChange?.(page);
  };

  React.useEffect(() => {
    onItemsChange?.(paginatedItems);
  }, [paginatedItems, onItemsChange]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage: handlePageChange,
    nextPage: () => handlePageChange(currentPage + 1),
    prevPage: () => handlePageChange(currentPage - 1),
  };
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  onNext,
  onPrev,
}: PaginationControlsProps) {
  const pages = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (string | number)[] = [];
    let l = 0;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`dots-${index}`} className="text-zinc-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`min-w-10 h-10 rounded-lg font-medium transition-colors ${
              currentPage === page
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
