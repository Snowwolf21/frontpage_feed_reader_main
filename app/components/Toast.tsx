"use client";

import { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-500/10 border-green-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
  }[type];

  const textColor = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  }[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      /* 🚀 FIXED: Kept string templates tightly organized on single flat execution lines */
      className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColor} max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300`}
    >
      <Icon className={`w-5 h-5 ${textColor} shrink-0`} />
      <p className={`text-sm font-medium ${textColor}`}>{message}</p>
    </div>
  );
}

export function useToast() {
  // 🚀 FIXED TYPE INFERENCE: Explicitly declare the strict array interface layout
  const [toasts, setToasts] = useState<Array<Required<Pick<ToastProps, 'message'>> & Partial<ToastProps> & { id: string }>>([]);

  const addToast = (props: ToastProps) => {
    /* 🚀 FIXED DEPRECATION: Switched from .substr() to standard non-deprecated .substring() */
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { ...props, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
}
