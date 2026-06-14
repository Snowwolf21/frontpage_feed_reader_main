"use client";

export function LoadingCard() {
  return (
    <div
      className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 animate-pulse"
      role="status"
      aria-label="Loading content"
    >
      <div className="h-6 bg-zinc-800 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-zinc-800 rounded w-full" />
        <div className="h-4 bg-zinc-800 rounded w-5/6" />
        <div className="h-4 bg-zinc-800 rounded w-4/6" />
      </div>
      <div className="flex gap-2 pt-4">
        <div className="h-10 bg-zinc-800 rounded flex-1" />
        <div className="h-10 bg-zinc-800 rounded flex-1" />
      </div>
    </div>
  );
}

export function LoadingGrid({ columns = 3 }: { columns?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {Array.from({ length: columns }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}

export function LoadingList() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading list">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-zinc-800 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}
