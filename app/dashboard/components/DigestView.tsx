"use client";

import { useEffect, useState, useMemo } from "react";
import { Newspaper, BookOpen, Clock, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useStore } from "@/app/store/useStore";
import type { NormalizedItem, MultiFeedEntry } from "@/app/api/feeds/_lib/feedParser";

interface AggregatedArticle extends NormalizedItem {
  feedUrl: string;
  feedTitle: string;
  category: string;
}

export default function DigestView() {
  const {
    subscriptions,
    articleStates,
    setActiveTab,
    setSelectedFeedUrl,
    setActiveCategory,
    selectArticle,
  } = useStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allArticles, setAllArticles] = useState<AggregatedArticle[]>([]);
  const [greeting, setGreeting] = useState("Hello");

  // 1. Greet user based on local time after mount (prevents SSR hydration timezone mismatch)
  useEffect(() => {
    const timer = setTimeout(() => {
      const hour = new Date().getHours();
      if (hour < 6) setGreeting("Good morning, early bird");
      else if (hour < 12) setGreeting("Good morning");
      else if (hour < 17) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 2. Fetch all articles across active subscriptions (with AbortController to prevent memory leaks)
  useEffect(() => {
    const controller = new AbortController();
    const fetchAllFeeds = async () => {
      if (subscriptions.length === 0) {
        setAllArticles([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const feedUrls = subscriptions.map((sub) => sub.feedUrl);
        const res = await fetch("/api/feeds/multi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: feedUrls }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to load aggregated feeds.");
        }

        const data = await res.json();
        const feedsData = (data.feeds || []) as MultiFeedEntry[];

        // Flatten all items and map back their metadata type-safely
        const successfulFeeds = feedsData.filter(
          (f): f is MultiFeedEntry & { ok: true } => f.ok
        );

        const flattened: AggregatedArticle[] = successfulFeeds.flatMap((f) => {
          const subscription = subscriptions.find(
            (sub) => sub.feedUrl.toLowerCase().trim() === f.url.toLowerCase().trim()
          );
          return f.items.map((item) => ({
            ...item,
            feedUrl: f.url,
            feedTitle: f.title || subscription?.title || "Untitled Feed",
            category: subscription?.category || "General",
          }));
        });

        // Sort by publication date descending
        flattened.sort((a, b) => {
          const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
          const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
          return dateB - dateA;
        });

        setAllArticles(flattened);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Digest aggregation error:", err);
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllFeeds();

    return () => {
      controller.abort();
    };
  }, [subscriptions]);

  // 3. Filter unread articles
  const unreadArticles = useMemo(() => {
    return allArticles.filter((item) => {
      const key = `${item.feedUrl}::${item.guid || item.link || item.title}`;
      const state = articleStates[key] || {};
      return !state.read;
    });
  }, [allArticles, articleStates]);

  // 4. Calculate reading metrics
  const estimatedReadTime = useMemo(() => {
    // Estimate 2 minutes average per unread article
    return unreadArticles.length * 2;
  }, [unreadArticles]);

  // 5. Navigate to full reading layout for a selected article
  const handleReadArticle = (article: AggregatedArticle) => {
    setActiveCategory(article.category);
    setSelectedFeedUrl(article.feedUrl);
    setActiveTab("feed");
    selectArticle(article.feedUrl, article);
  };

  // Render Loading Skeleton State
  if (isLoading) {
    return (
      <section className="flex-1 p-6 md:p-10 max-h-[calc(100vh-4rem)] overflow-y-auto bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Assembling your daily digest...</p>
        </div>
      </section>
    );
  }

  // Render Empty State (No Subscriptions)
  if (subscriptions.length === 0) {
    return (
      <section className="flex-1 p-6 md:p-10 max-h-[calc(100vh-4rem)] overflow-y-auto bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center max-w-sm space-y-4">
          <Newspaper className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-xl font-bold tracking-tight">Your Digest is empty</h3>
          <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-450">
            Subscribe to some feeds inside the <button onClick={() => setActiveTab("discover")} className="font-semibold text-indigo-600 dark:text-indigo-400 underline cursor-pointer hover:no-underline">Discover</button> tab to generate summaries.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-6 md:p-10 max-h-[calc(100vh-4rem)] overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">
        {/* Greetings Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {greeting}, Reader
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Here is your personal overview across your active feed channels.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/10 bg-red-500/5 p-4 text-sm text-red-650 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Could not compile some feeds: {error}</span>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-650 dark:bg-indigo-950/50 dark:text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Unread Articles</p>
              <h4 className="text-2xl font-black mt-0.5">{unreadArticles.length}</h4>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-650 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Estimated Read Time</p>
              <h4 className="text-2xl font-black mt-0.5">{estimatedReadTime} mins</h4>
            </div>
          </div>
        </div>

        {/* Top Headlines Section */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <h3 className="text-lg font-bold tracking-tight mb-4">Latest Headlines</h3>
          {unreadArticles.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-sm">
              ✨ You are all caught up! No unread articles.
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-zinc-150 dark:divide-zinc-800">
              {unreadArticles.slice(0, 5).map((article, idx) => (
                <div
                  key={`${article.feedUrl}-${idx}`}
                  onClick={() => handleReadArticle(article)}
                  className="pt-4 first:pt-0 group flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                        {article.feedTitle}
                      </span>
                      <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400 font-semibold uppercase">
                        {article.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold mt-1.5 text-zinc-900 group-hover:text-indigo-650 dark:text-zinc-100 dark:group-hover:text-indigo-400 transition-colors leading-6">
                      {article.title}
                    </h4>
                    {article.summary && (
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                        {article.summary.replace(/<[^>]*>/g, "")}
                      </p>
                    )}
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 opacity-0 group-hover:opacity-100 group-hover:bg-zinc-50 dark:border-zinc-800 dark:group-hover:bg-zinc-900 shrink-0 transition-all">
                    <ArrowRight className="h-4 w-4 text-zinc-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
