"use client";

import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title, description, onRetry, retryLabel = 'Try Again' }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-red-400 mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 mb-6 max-w-sm">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30"
    >
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
}

interface FieldErrorProps {
  error?: string;
  touched?: boolean;
}

export function FieldError({ error, touched }: FieldErrorProps) {
  if (!touched || !error) return null;

  return (
    <p className="text-xs text-red-400 mt-1" role="alert">
      {error}
    </p>
  );
}
