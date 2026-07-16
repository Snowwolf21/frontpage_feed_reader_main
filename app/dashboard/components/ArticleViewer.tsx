"use client";

import { useMemo } from "react";
import { ExternalLink, Rss, Star } from "lucide-react";
import { useStore } from "@/app/store/useStore";
import type { NormalizedItem } from "@/app/api/feeds/_lib/feedParser";

function articleKey(feedUrl: string, article: NormalizedItem) {
  return `${feedUrl}::${article.guid || article.link || article.title}`;
}

function escapeHtml(str: string | null) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeArticleHtml(html: string | null) {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const allowedTags = new Set([
    "A", "B", "BLOCKQUOTE", "BR", "CODE", "EM", "FIGCAPTION", "FIGURE",
    "H1", "H2", "H3", "H4", "HR", "I", "IMG", "LI", "OL", "P", "PRE", "STRONG", "UL",
  ]);
  const allowedAttrs = new Set(["href", "src", "alt", "title"]);

  doc.body.querySelectorAll("*").forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      if (!allowedAttrs.has(attribute.name.toLowerCase())) {
        element.removeAttribute(attribute.name);
      }
    });

    if (element.tagName === "A") {
      const href = element.getAttribute("href") || "";
      if (!href.startsWith("http://") && !href.startsWith("https://")) {
        element.removeAttribute("href");
      }
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }

    if (element.tagName === "IMG") {
      const src = element.getAttribute("src") || "";
      if (!src.startsWith("http://") && !src.startsWith("https://")) {
        element.remove();
      } else {
        element.setAttribute("loading", "lazy");
      }
    }
  });

  return doc.body.innerHTML;
}

export default function ArticleViewer() {
  const {
    subscriptions,
    selectedFeedUrl,
    selectedArticle,
    articleStates,
    saveArticleState,
    mounted,
  } = useStore();

  const selectedSubscription = subscriptions.find((sub) => sub.feedUrl === selectedFeedUrl);
  const selectedArticleState = selectedArticle ? articleStates[articleKey(selectedFeedUrl, selectedArticle)] || {} : {};

  const safeContent = useMemo(() => {
    if (!mounted || !selectedArticle) return "";
    return sanitizeArticleHtml(selectedArticle.content || selectedArticle.summary || "");
  }, [selectedArticle, mounted]);

  const handleToggleBookmark = async (article: NormalizedItem, currentBookmarked: boolean) => {
    try {
      await saveArticleState(selectedFeedUrl, article, { bookmarked: !currentBookmarked });
    } catch (e) {
      console.error("Failed to toggle bookmark state", e);
    }
  };

  return (
    <article className="max-h-[calc(100vh-4rem)] overflow-y-auto bg-white p-5 dark:bg-zinc-950 md:p-8">
      {selectedArticle ? (
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold leading-tight">{selectedArticle.title}</h2>
              <p className="mt-3 text-sm text-zinc-500">
                {selectedArticle.author || selectedSubscription?.title || "Feed item"}
                {selectedArticle.pubDate ? ` - ${new Date(selectedArticle.pubDate).toLocaleString()}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleBookmark(selectedArticle, !!selectedArticleState.bookmarked)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                aria-label="Toggle bookmark"
              >
                <Star className={`h-4 w-4 ${selectedArticleState.bookmarked ? "fill-current text-amber-500" : ""}`} />
              </button>
              {selectedArticle.link && (
                <a
                  href={selectedArticle.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  aria-label="Open original"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
          {selectedArticle.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selectedArticle.thumbnail} alt="" className="mb-6 max-h-80 w-full rounded-md object-cover" />
          )}
          <div
            className="feed-reader-content text-zinc-800 dark:text-zinc-100"
            dangerouslySetInnerHTML={{
              __html: safeContent
                ? safeContent
                : selectedArticle.summary
                ? `<p>${escapeHtml(selectedArticle.summary)}</p>`
                : `<p class="text-zinc-400 italic">No content available for this article.</p>`,
            }}
          />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-center text-zinc-500">
          <div>
            <Rss className="mx-auto mb-3 h-8 w-8" />
            <p>Select a feed article to start reading.</p>
          </div>
        </div>
      )}
    </article>
  );
}
