"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface ApiRequestOptions<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: T;
  headers?: Record<string, string>;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const request = useCallback(
    async <T,>(
      url: string,
      options: ApiRequestOptions<T> = {}
    ): Promise<any> => {
      const { method = 'GET', body, headers = {}, onSuccess, onError } = options;

      // Cancel previous request if one is in flight
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const responseData = await response.json();
        setData(responseData);
        onSuccess?.(responseData);
        return responseData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        if (error.name !== 'AbortError') {
          setError(error);
          onError?.(error);
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { loading, error, data, request, cancel };
}
