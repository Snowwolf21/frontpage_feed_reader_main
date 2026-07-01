"use client";

import React from "react";

export function EmptyState({ 
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 text-zinc-400">{Icon}</div>
      <h3 className="text-lg font-semibold text-zinc-200 mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 mb-6 max-w-sm">{description}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
