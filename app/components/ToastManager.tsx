'use client';

import { useState, useCallback } from 'react';

// Define the available toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Define the structure of a single toast item
export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export function useToastManager() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // 1. Remove toast by filtering the state
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // 2. Add toast and set a self-contained timer to remove itself
  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 5000) => {
      // Use crypto.randomUUID() or timestamp for safer unique keys
      const id = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 11) + Date.now();

      const newToast: ToastItem = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      // Safely schedule removal
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return { toasts, addToast, removeToast };
}
