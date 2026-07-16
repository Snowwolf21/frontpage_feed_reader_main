"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/app/store/useStore";

/**
 * Global vim-style keyboard shortcuts for the dashboard.
 *
 * Bindings (only active when no input/textarea is focused):
 *   j  → Select next article
 *   k  → Select previous article
 *   r  → Toggle read/unread on selected article
 *   b  → Toggle bookmarked on selected article
 *   v  → Open article link in new tab
 *   /  → Focus the global search input
 */
export function useKeyboardShortcuts() {
  const store = useStore();
  // Stable ref so we never re-register listeners on every render
  const storeRef = useRef(store);
  useEffect(() => {
    storeRef.current = store;
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip when user is typing in any input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const {
        selectedArticle,
        selectedFeedUrl,
        articleStates,
        saveArticleState,
        selectNextArticle,
        selectPrevArticle,
        setSearch,
      } = storeRef.current;

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          selectNextArticle();
          break;

        case "k":
        case "ArrowUp":
          e.preventDefault();
          selectPrevArticle();
          break;

        case "r":
          if (!selectedArticle) break;
          e.preventDefault();
          {
            const key = `${selectedFeedUrl}::${selectedArticle.guid || selectedArticle.link || selectedArticle.title}`;
            const state = articleStates[key] || {};
            saveArticleState(selectedFeedUrl, selectedArticle, { read: !state.read });
          }
          break;

        case "b":
          if (!selectedArticle) break;
          e.preventDefault();
          {
            const key = `${selectedFeedUrl}::${selectedArticle.guid || selectedArticle.link || selectedArticle.title}`;
            const state = articleStates[key] || {};
            saveArticleState(selectedFeedUrl, selectedArticle, { bookmarked: !state.bookmarked });
          }
          break;

        case "v":
          if (!selectedArticle?.link) break;
          e.preventDefault();
          window.open(selectedArticle.link, "_blank", "noopener,noreferrer");
          break;

        case "/":
          e.preventDefault();
          {
            const searchInput = document.querySelector<HTMLInputElement>(
              "input[placeholder='Search feeds']"
            );
            if (searchInput) {
              searchInput.focus();
              setSearch("");
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
