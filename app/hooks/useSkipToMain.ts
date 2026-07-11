"use client";

import { useCallback, useRef } from "react";

export function useSkipToMain() {
  const mainRef = useRef<HTMLElement>(null);

  const skipToMain = useCallback(() => {
    const element = mainRef.current;

    if (!element) return;

    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    element.focus({ preventScroll: true });

    element.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  return {
    mainRef,
    skipToMain,
  };
}