"use client";

import { useState, useCallback } from "react";

interface LoadingState {
  isLoading: boolean;
  progress?: number; // 0-100
  message?: string;
}

export function useLoading(initialState: boolean = false) {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialState,
    progress: 0,
    message: undefined,
  });

  const start = useCallback((message?: string) => {
    setState({
      isLoading: true,
      progress: 0,
      message,
    });
  }, []);

  const stop = useCallback(() => {
    setState({
      isLoading: false,
      progress: 100,
      message: undefined,
    });
  }, []);

  const setProgress = useCallback((progress: number, message?: string) => {
    setState((prev) => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message ?? prev.message,
    }));
  }, []);

  const setMessage = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      message,
    }));
  }, []);

  return {
    ...state,
    start,
    stop,
    setProgress,
    setMessage,
  };
}
