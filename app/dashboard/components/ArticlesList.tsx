"use client";

import { Bookmark, Check } from "lucide-react";
import { useStore } from "@/app/store/useStore";
import type { NormalizedItem } from "@/app/api/feeds/_lib/feedParser";

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
  } = useStore();

  const selectedSubscription = subscriptions.find((sub) => sub.feedUrl === selectedFeedUrl);

  const handleSelectArticle = (article: NormalizedItem) => {
    selectArticle(selectedFeedUrl, article);
  };

  return (
    <section className="border-r border-zinc-200 dark:border-zinc-800">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm font-semibold">{selectedSubscription?.title || feedData?.title || "Select a feed"}</p>
        <p className="mt-1 text-xs text-zinc-500">{feedData?.items?.length || 0} articles loaded</p>
      </div>
      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
        {isLoadingFeed && <p className="p-4 text-sm text-zinc-500">Loading feed...</p>}
        {!isLoadingFeed &&
          feedData?.items?.map((article) => {
            const state = articleStates[articleKey(selectedFeedUrl, article)] || {};
            return (
              <button
                key={article.guid || article.link || article.title}
                type="button"
                onClick={() => handleSelectArticle(article)}
                className={`block w-full border-b border-zinc-200 p-4 text-left hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-900 ${
                  selectedArticle === article ? "bg-white dark:bg-zinc-900" : ""
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className={`text-sm font-semibold leading-5 ${state.read ? "text-zinc-500" : ""}`}>{article.title}</span>
                  {state.bookmarked && <Bookmark className="h-4 w-4 shrink-0 fill-current text-amber-500" />}
                </span>
                <span className="mt-2 line-clamp-3 block text-xs leading-5 text-zinc-500">{stripHtml(article.summary || article.content)}</span>
                <span className="mt-3 flex items-center gap-2 text-[11px] text-zinc-400">
                  {state.read && <Check className="h-3 w-3" />}
                  {article.author || "Unknown author"} {article.pubDate ? `- ${new Date(article.pubDate).toLocaleDateString()}` : ""}
                </span>
              </button>
            );
          })}
      </div>
    </section>
  );
}
