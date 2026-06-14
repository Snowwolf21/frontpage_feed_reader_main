"use client";

import { useState, useCallback } from "react";
import Toast from "./Toast";

interface ToastManagerContextType {
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'; duration: number }>;
}

export function useToastManager() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'; duration: number }>>([]);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 5000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = { id, message, type, duration };
      setToasts((prev) => [...prev, newToast]);

      // Auto-remove toast after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastManager();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
