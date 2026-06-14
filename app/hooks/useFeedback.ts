"use client";

import { useState, useCallback } from "react";

interface FeedbackMessage {
  type: 'loading' | 'success' | 'error' | 'warning';
  message: string;
}

export function useFeedback() {
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const show = useCallback((type: FeedbackMessage['type'], message: string, duration: number = 3000) => {
    setFeedback({ type, message });
    setIsVisible(true);

    if (duration > 0) {
      setTimeout(() => {
        setIsVisible(false);
      }, duration);
    }
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  const showLoading = useCallback((message: string) => {
    show('loading', message, 0); // Don't auto-hide loading
  }, [show]);

  const showSuccess = useCallback((message: string, duration?: number) => {
    show('success', message, duration);
  }, [show]);

  const showError = useCallback((message: string, duration?: number) => {
    show('error', message, duration);
  }, [show]);

  const showWarning = useCallback((message: string, duration?: number) => {
    show('warning', message, duration);
  }, [show]);

  return {
    feedback,
    isVisible,
    show,
    hide,
    showLoading,
    showSuccess,
    showError,
    showWarning,
  };
}
