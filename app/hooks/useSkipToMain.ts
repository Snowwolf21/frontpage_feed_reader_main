"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to skip to main content (accessibility best practice)
 * Use with a skip link button near the top of your layout
 */
export function useSkipToMain() {
  const mainRef = useRef<HTMLElement>(null);

  const skipToMain = () => {
    mainRef.current?.focus();
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return { mainRef, skipToMain };
}

/**
 * Usage example:
 * 
 * const { mainRef, skipToMain } = useSkipToMain();
 * 
 * return (
 *   <>
 *     <a href="#main" onClick={(e) => { e.preventDefault(); skipToMain(); }} 
 *        className="sr-only focus:not-sr-only">
 *       Skip to main content
 *     </a>
 *     <main ref={mainRef} tabIndex={-1}>
 *       {children}
 *     </main>
 *   </>
 * );
 */
