"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// 1. FIXED: Added a generic parameter R for the response data structure
interface ApiRequestOptions<T, R> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: T;
  headers?: Record<string, string>;
  onSuccess?: (data: R) => void; // No more any
  onError?: (error: Error) => void;
}

export function useApi<R = unknown>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // 2. FIXED: Use the response generic or null for state tracking
  const [data, setData] = useState<R | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 3. FIXED: Adjusted function to handle request payload T and expected response R dynamically
  const request = useCallback(
    async <T, RequestResponse = R>(
      url: string,
      options: ApiRequestOptions<T, RequestResponse> = {}
    ): Promise<RequestResponse> => {
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

        const responseData = (await response.json()) as RequestResponse;
        
        // Safely update state if it aligns with the hook's base configuration type
        setData(responseData as unknown as R);
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
