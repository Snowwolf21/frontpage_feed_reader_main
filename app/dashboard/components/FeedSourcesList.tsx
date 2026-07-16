"use client";

import { useMemo } from "react";
import { Rss, Trash2 } from "lucide-react";
import { useStore } from "@/app/store/useStore";
import type { Subscription } from "@/app/store/useStore";

export default function FeedSourcesList() {
  const {
    subscriptions,
    activeCategory,
    search,
    selectedFeedUrl,
    setSelectedFeedUrl,
    removeSubscription,
  } = useStore();

  const visibleSubscriptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return subscriptions.filter((sub) => {
      const matchesCategory = activeCategory === "All Feeds" || sub.category === activeCategory;
      const matchesSearch =
        !normalizedSearch ||
        sub.title.toLowerCase().includes(normalizedSearch) ||
        sub.description.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search, subscriptions]);

  const handleRemoveSubscription = async (subscription: Subscription) => {
    try {
      await removeSubscription(subscription);
    } catch (e) {
      console.error("Failed to remove subscription", e);
    }
  };

  return (
    <section className="border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Sources</p>
        <h2 className="mt-1 text-2xl font-bold">Latest Posts</h2>
      </div>
      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-3">
        {visibleSubscriptions.map((subscription) => (
          <div key={subscription.feedUrl} className="group mb-2 flex items-start gap-2">
            <button
              type="button"
              onClick={() => setSelectedFeedUrl(subscription.feedUrl)}
              className={`flex min-h-20 flex-1 items-start gap-3 rounded-md border p-3 text-left ${
                selectedFeedUrl === subscription.feedUrl
                  ? "border-zinc-900 bg-white dark:border-zinc-100 dark:bg-zinc-900"
                  : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
              }`}
            >
              <Rss className="mt-1 h-4 w-4 shrink-0 text-zinc-500" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{subscription.title}</span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-zinc-500">{subscription.description}</span>
                <span className="mt-2 inline-block rounded bg-zinc-100 px-2 py-1 text-[10px] font-bold uppercase text-zinc-500 dark:bg-zinc-800">
                  {subscription.category}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleRemoveSubscription(subscription)}
              className="mt-2 hidden h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-500 group-hover:flex dark:hover:bg-red-950/30"
              aria-label="Remove subscription"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
