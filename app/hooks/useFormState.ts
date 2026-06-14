"use client";

import { useState, useCallback } from "react";

interface FormState {
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  values: Record<string, any>;
}

export function useFormState(initialValues: Record<string, any> = {}) {
  const [state, setState] = useState<FormState>({
    isSubmitting: false,
    errors: {},
    touched: {},
    values: initialValues,
  });

  const setFieldValue = useCallback((field: string, value: any) => {
    setState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value,
      },
    }));
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error,
      },
    }));
  }, []);

  const setFieldTouched = useCallback((field: string, touched: boolean = true) => {
    setState((prev) => ({
      ...prev,
      touched: {
        ...prev.touched,
        [field]: touched,
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
      isSubmitting: false,
      errors: {},
      touched: {},
      values: initialValues,
    });
  }, [initialValues]);

  const setErrors = useCallback((errors: Record<string, string>) => {
    setState((prev) => ({
      ...prev,
      errors,
    }));
  }, []);

  return {
    ...state,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setSubmitting,
    setErrors,
    resetForm,
  };
}
