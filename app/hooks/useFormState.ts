"use client";

import { useCallback, useState } from "react";

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}

export function useFormState<T extends Record<string, unknown>>(
  initialValues: T
) {
  // Capture the initial values only once
  const [initialState] = useState(initialValues);

  const [state, setState] = useState<FormState<T>>({
    values: initialState,
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setState((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          [field]: value,
        },
      }));
    },
    []
  );

  const setFieldError = useCallback(
    <K extends keyof T>(field: K, error?: string) => {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: error,
        },
      }));
    },
    []
  );

  const setFieldTouched = useCallback(
    <K extends keyof T>(field: K, touched = true) => {
      setState((prev) => ({
        ...prev,
        touched: {
          ...prev.touched,
          [field]: touched,
        },
      }));
    },
    []
  );

  const setErrors = useCallback(
    (errors: Partial<Record<keyof T, string>>) => {
      setState((prev) => ({
        ...prev,
        errors,
      }));
    },
    []
  );

  const setValues = useCallback((values: Partial<T>) => {
    setState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        ...values,
      },
    }));
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState((prev) => ({
      ...prev,
      isSubmitting,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState({
      values: initialState,
      errors: {},
      touched: {},
      isSubmitting: false,
    });
  }, [initialState]);

  return {
    ...state,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setErrors,
    setValues,
    setSubmitting,
    resetForm,
  };
}