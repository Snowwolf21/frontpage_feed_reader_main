"use client";

import { useEffect } from "react";

/**
 * Hook to manage focus visibility (keyboard navigation indicator)
 * Shows focus ring only when navigating with keyboard, not with mouse
 */
export function useFocusVisible() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab key to enable keyboard navigation
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-nav');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
}

/**
 * Global CSS for keyboard navigation visibility
 * Add this to your globals.css:
 * 
 * @layer utilities {
 *   .keyboard-nav:focus-within :focus {
 *     @apply outline-2 outline-offset-2 outline-blue-500;
 *   }
 * }
 */
