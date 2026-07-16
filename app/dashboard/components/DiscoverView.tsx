"use client";

import { useState } from "react";
import { Compass, Plus, Check, Loader2, Rss } from "lucide-react";
import { useStore } from "@/app/store/useStore";
import { Button } from "@/components/ui/button";

interface CuratedFeedItem {
  title: string;
  feedUrl: string;
  category: string;
  description: string;
}

const CURATED_FEEDS: CuratedFeedItem[] = [
  {
    title: "Hacker News",
    feedUrl: "https://news.ycombinator.com/rss",
    category: "Tech",
    description: "The prime tech, science, and software engineering social forum.",
  },
  {
    title: "Smashing Magazine",
    feedUrl: "https://www.smashingmagazine.com/feed/",
    category: "Design",
    description: "Editorial articles on web design, user experience, and graphics.",
  },
  {
    title: "CSS-Tricks",
    feedUrl: "https://css-tricks.com/feed/",
    category: "Frontend",
    description: "Essential design articles and CSS techniques for web developers.",
  },
  {
    title: "Vercel Blog",
    feedUrl: "https://vercel.com/blog/feed",
    category: "Tech",
    description: "Latest news, tech updates, serverless computing, and Next.js guides.",
  },
  {
    title: "Overreacted",
    feedUrl: "https://overreacted.io/rss.xml",
    category: "Frontend",
    description: "Personal frontend and engineering blog posts by Dan Abramov.",
  },
];

export default function DiscoverView() {
  const {
    subscriptions,
    addFeed,
    setFeedUrlInput,
    setCategoryInput,
  } = useStore();

  const [subscribingUrl, setSubscribingUrl] = useState<string | null>(null);

  const handleSubscribe = async (item: CuratedFeedItem) => {
    try {
      setSubscribingUrl(item.feedUrl);
      setFeedUrlInput(item.feedUrl);
      setCategoryInput(item.category);
      await addFeed();
    } catch (e) {
      console.error("Failed to subscribe via curated list:", e);
    } finally {
      setSubscribingUrl(null);
    }
  };

  return (
    <section className="flex-1 p-6 md:p-10 max-h-[calc(100vh-4rem)] overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Discover feeds</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Populate your timeline instantly by subscribing to curated premium design and tech blogs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CURATED_FEEDS.map((item) => {
            const isSubscribed = subscriptions.some(
              (sub) => sub.feedUrl.toLowerCase().trim() === item.feedUrl.toLowerCase().trim()
            );
            const isPending = subscribingUrl === item.feedUrl;

            return (
              <div
                key={item.feedUrl}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {item.category}
                    </span>
                    <Rss className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <h3 className="mt-3 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6">
                  {isSubscribed ? (
                    <Button
                      variant="ghost"
                      disabled
                      className="w-full flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 disabled:opacity-100"
                    >
                      <Check className="h-4 w-4" />
                      <span>Subscribed</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(item)}
                      disabled={isPending}
                      className="w-full text-xs font-semibold"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 shrink-0" />
                          <span>Subscribe</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
