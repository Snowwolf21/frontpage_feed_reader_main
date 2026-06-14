"use client";

import { useState, useEffect } from "react";
import { Loader } from "lucide-react";

interface SkeletonProps {
  count?: number;
  height?: string;
  width?: string;
  className?: string;
}

export function SkeletonLoader({ count = 3, height = 'h-12', className = '' }: SkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} w-full bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-lg animate-pulse`}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading card">
      <div className="h-40 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-2xl animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded animate-pulse" />
        <div className="h-4 w-full bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8" role="status" aria-label="Loading">
      <div className="relative w-12 h-12">
        <Loader className="w-12 h-12 text-zinc-400 animate-spin" />
      </div>
    </div>
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function ConditionalLoader({ isLoading, children, loadingComponent }: LoadingStateProps) {
  return isLoading ? loadingComponent || <LoadingSpinner /> : children;
}
