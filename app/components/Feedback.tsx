"use client";

import { Loader, AlertCircle, CheckCircle } from "lucide-react";

interface ProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

export function ProgressBar({ progress, showLabel = false, color = 'blue' }: ProgressBarProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="w-full space-y-2">
      <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-300`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-zinc-400">
          {progress}% complete
        </p>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number; // 0-100
}

export function LoadingOverlay({ isVisible, message, progress }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
      role="status"
      aria-live="polite"
      aria-label={message || 'Loading'}
    >
      <div className="bg-zinc-800 rounded-lg p-8 max-w-sm text-center space-y-4">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
        {message && <p className="text-white font-medium">{message}</p>}
        {progress !== undefined && (
          <ProgressBar progress={progress} showLabel color="blue" />
        )}
      </div>
    </div>
  );
}

interface FeedbackToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function FeedbackToast({ type, message, isVisible, onClose }: FeedbackToastProps) {
  if (!isVisible) return null;

  const typeConfig = {
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: CheckCircle,
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: AlertCircle,
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: AlertCircle,
    },
  }[type];

  const Icon = typeConfig.icon;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg border ${typeConfig.bg} ${typeConfig.border} max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300`}
    >
      <Icon className={`w-5 h-5 ${typeConfig.text} flex-shrink-0`} />
      <p className={`text-sm font-medium ${typeConfig.text}`}>{message}</p>
      <button
        onClick={onClose}
        className="ml-4 text-zinc-500 hover:text-zinc-400"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
