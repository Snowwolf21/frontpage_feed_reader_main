"use client";

import { useMemo } from "react";

import { Bookmark, Check } from "lucide-react";
import { useStore } from "@/app/store/useStore";
import type { NormalizedItem } from "@/app/api/feeds/_lib/feedParser";
import { Button } from "@/components/ui/button";

function articleKey(feedUrl: string, article: NormalizedItem) {
  return `${feedUrl}::${article.guid || article.link || article.title}`;
}

function stripHtml(html: string | null) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function ArticlesList() {
  const {
    subscriptions,
    selectedFeedUrl,
    feedData,
    isLoadingFeed,
    articleStates,
    selectedArticle,
    selectArticle,
    saveArticleState,
    setViewMode,
    search,
  } = useStore();

  const selectedSubscription = subscriptions.find((sub) => sub.feedUrl === selectedFeedUrl);

  const filteredItems = useMemo(() => {
    if (!feedData || !feedData.items) return [];
    const query = search.trim().toLowerCase();
    if (!query) return feedData.items;
    return feedData.items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.summary && item.summary.toLowerCase().includes(query)) ||
        (item.content && item.content.toLowerCase().includes(query))
    );
  }, [feedData, search]);

  const handleSelectArticle = (article: NormalizedItem) => {
    selectArticle(selectedFeedUrl, article);
  };

  const handleToggleRead = async (article: NormalizedItem) => {
    const key = articleKey(selectedFeedUrl, article);
    const currentState = articleStates[key] || {};
    const isCurrentlyRead = !!currentState.read;
    await saveArticleState(selectedFeedUrl, article, { read: !isCurrentlyRead });
  };

  return (
    <section className="border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{selectedSubscription?.title || feedData?.title || "Select a feed"}</p>
          <p className="mt-1 text-xs text-zinc-500">{filteredItems.length} articles loaded</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setViewMode("sources")}
          className="md:hidden text-xs h-8 px-2.5 shrink-0"
        >
          ← Feeds
        </Button>
      </div>
      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
        {isLoadingFeed && <p className="p-4 text-sm text-zinc-500">Loading feed...</p>}
        {!isLoadingFeed && filteredItems.length === 0 && feedData?.items && (
          <p className="p-4 text-sm text-zinc-500 text-center">No articles match your search.</p>
        )}
        {!isLoadingFeed &&
          filteredItems.map((article) => {
            const state = articleStates[articleKey(selectedFeedUrl, article)] || {};
            return (
              <div
                key={article.guid || article.link || article.title}
                onClick={() => handleSelectArticle(article)}
                className={`group block w-full border-b border-zinc-200 p-4 text-left hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-900 cursor-pointer transition-colors ${
                  selectedArticle === article ? "bg-white dark:bg-zinc-900" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Read/Unread dot indicator and interactive button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleRead(article);
                    }}
                    className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all focus:outline-none"
                    title={state.read ? "Mark as unread" : "Mark as read"}
                  >
                    {state.read ? (
                      <div className="h-2.5 w-2.5 rounded-full border border-zinc-300 bg-transparent transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-800" />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 transition-transform hover:scale-110 dark:bg-indigo-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span className="flex items-start justify-between gap-3">
                      <span className={`text-sm font-semibold leading-5 transition-colors ${state.read ? "text-zinc-500" : "text-zinc-900 dark:text-zinc-100"}`}>{article.title}</span>
                      {state.bookmarked && <Bookmark className="h-4 w-4 shrink-0 fill-current text-amber-500" />}
                    </span>
                    <span className="mt-2 line-clamp-3 block text-xs leading-5 text-zinc-500">{stripHtml(article.summary || article.content)}</span>
                    <span className="mt-3 flex items-center gap-2 text-[11px] text-zinc-400">
                      {state.read && <Check className="h-3 w-3" />}
                      {article.author || "Unknown author"} {article.pubDate ? `- ${new Date(article.pubDate).toLocaleDateString()}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
