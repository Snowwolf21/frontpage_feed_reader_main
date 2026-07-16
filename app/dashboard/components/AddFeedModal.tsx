"use client";

import type { FormEvent } from "react";
import { X } from "lucide-react";
import { useStore } from "@/app/store/useStore";
import { Button } from "@/components/ui/button";

export default function AddFeedModal() {
  const {
    isAddOpen,
    setIsAddOpen,
    feedUrlInput,
    categoryInput,
    isAddingFeed,
    setFeedUrlInput,
    setCategoryInput,
    addFeed,
  } = useStore();

  if (!isAddOpen) return null;

  const handleAddFeedSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await addFeed();
    } catch (e) {
      console.error("Failed to add feed", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={handleAddFeedSubmit} className="w-full max-w-md rounded-md bg-white p-5 shadow-xl dark:bg-zinc-900">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Add Feed</h2>
          <Button type="button" variant="ghost" size="icon" onClick={() => setIsAddOpen(false)} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <label className="mb-2 block text-sm font-medium" htmlFor="feed-url">
          RSS or Atom URL
        </label>
        <input
          id="feed-url"
          type="url"
          value={feedUrlInput}
          onChange={(event) => setFeedUrlInput(event.target.value)}
          className="mb-4 h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 outline-none focus:border-zinc-500 dark:border-zinc-700"
          placeholder="https://example.com/feed.xml"
          pattern="https?://(?:[\w-]+\.)+[\w-]{2,}(?::\d{2,5})?(?:/[^\s]*)?"
          title="Enter a valid URL beginning with http:// or https://."
          required
        />
        <label className="mb-2 block text-sm font-medium" htmlFor="feed-category">
          Category
        </label>
        <input
          id="feed-category"
          type="text"
          value={categoryInput}
          onChange={(event) => setCategoryInput(event.target.value)}
          className="mb-5 h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 outline-none focus:border-zinc-500 dark:border-zinc-700"
          placeholder="Frontend"
          pattern="[A-Za-z0-9][A-Za-z0-9 &/_-]{1,39}"
          title="Use 2-40 characters: letters, numbers, spaces, &, /, _ or -."
        />
         <Button
          type="submit"
          disabled={isAddingFeed}
          className="w-full h-10"
        >
          {isAddingFeed ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Adding...
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>
    </div>
  );
}
