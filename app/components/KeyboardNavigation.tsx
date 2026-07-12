"use client";

import { useEffect } from "react";

interface KeyboardNavigationProps {
  children: React.ReactNode;
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
}

export function KeyboardNavigation({
  children,
  onEnter,
  onEscape,
  onArrowUp,
  onArrowDown,
}: KeyboardNavigationProps) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          onEnter?.();
          break;
        case 'Escape':
          event.preventDefault();
          onEscape?.();
          break;
        case 'ArrowUp':
          event.preventDefault();
          onArrowUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onArrowDown?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onEnter, onEscape, onArrowUp, onArrowDown]);

  return <>{children}</>;
}
