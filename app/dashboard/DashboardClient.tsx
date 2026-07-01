"use client";

import Link from "next/link";
// import jwt from "jsonwebtoken";
// import { cookies } from "next/headers";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Check,
  ExternalLink,
  FileUp,
  LogIn,
  LogOut,
  Moon,
  Plus,
  Rss,
  SearchIcon,
  Star,
  Sun,
  Trash2,
  User,
  X,
} from "lucide-react";
import AuthModal from "@/app/components/AuthModal";
import type { Feed, SampleFeeds } from "@/app/components/FeedDisplay";
import type { FeedResponse, NormalizedItem } from "@/app/api/feeds/_lib/feedParser";
import Logo from "@/components/ui/logo";

type UserProfile = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
};

type Subscription = Feed & {
  _id?: string;
  category: string;
};

type ArticleState = {
  read?: boolean;
  bookmarked?: boolean;
};



const GUEST_SUBSCRIPTIONS_KEY = "frontpage:guest-subscriptions";
const GUEST_ARTICLE_STATES_KEY = "frontpage:guest-article-states";
const THEME_KEY = "frontpage:theme";
const FEED_URL_REGEX = /^https?:\/\/(?:[\w-]+\.)+[\w-]{2,}(?::\d{2,5})?(?:\/[^\s]*)?$/i;
const CATEGORY_REGEX = /^[A-Za-z0-9][A-Za-z0-9 &/_-]{1,39}$/;

function flattenSampleFeeds(sampleFeeds: SampleFeeds): Subscription[] {
  return sampleFeeds.categories.flatMap((category) =>
    category.feeds.map((feed) => ({
      ...feed,
      category: category.name,
    }))
  );
}

function articleKey(feedUrl: string, article: NormalizedItem) {
  return `${feedUrl}::${article.guid || article.link || article.title}`;
}

function getArticleId(article: NormalizedItem) {
  return article.guid || article.link || article.title;
}

function stripHtml(html: string | null) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function sanitizeArticleHtml(html: string | null) {
  if (typeof window === "undefined" || !html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const allowedTags = new Set([
    "A",
    "B",
    "BLOCKQUOTE",
    "BR",
    "CODE",
    "EM",
    "FIGCAPTION",
    "FIGURE",
    "H1",
    "H2",
    "H3",
    "H4",
    "HR",
    "I",
    "IMG",
    "LI",
    "OL",
    "P",
    "PRE",
    "STRONG",
    "UL",
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

export default function DashboardClient({ sampleFeeds }: { sampleFeeds: SampleFeeds }) {
  const sampleSubscriptions = useMemo(() => flattenSampleFeeds(sampleFeeds), [sampleFeeds]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(sampleSubscriptions);
  const [activeCategory, setActiveCategory] = useState("All Feeds");
  const [selectedFeedUrl, setSelectedFeedUrl] = useState(sampleSubscriptions[0]?.feedUrl || "");
  const [search, setSearch] = useState("");
  const [feedData, setFeedData] = useState<FeedResponse | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NormalizedItem | null>(null);
  const [articleStates, setArticleStates] = useState<Record<string, ArticleState>>({});
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [feedUrlInput, setFeedUrlInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("General");
  const [theme, setTheme] = useState<"light" | "dark">("light");


  const isGuest = !user;

  const refreshSession = async () => {
    setIsLoadingSession(true);
    try {
    
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      setUser(data.user || null);
    } finally {
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    refreshSession();

    const storedTheme =
      typeof window !== "undefined" ? (localStorage.getItem(THEME_KEY) as "light" | "dark" | null) : null;
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(storedTheme || preferredTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (isLoadingSession) return;

    async function loadSubscriptions() {
      if (!user) {
        const stored = localStorage.getItem(GUEST_SUBSCRIPTIONS_KEY);
        const guestSubscriptions = stored ? (JSON.parse(stored) as Subscription[]) : sampleSubscriptions;
        setSubscriptions(guestSubscriptions);
        setSelectedFeedUrl((current) => current || guestSubscriptions[0]?.feedUrl || "");
        return;
      }

      const response = await fetch("/api/subscriptions");
      if (!response.ok) return;
      const data = await response.json();
      const savedSubscriptions = (data.subscriptions || []) as Subscription[];
      setSubscriptions(savedSubscriptions);
      setSelectedFeedUrl(savedSubscriptions[0]?.feedUrl || "");
    }

    loadSubscriptions();
  }, [isLoadingSession, sampleSubscriptions, user]);

  useEffect(() => {
    if (!selectedFeedUrl) return;

    async function loadFeed() {
      setIsLoadingFeed(true);
      setStatus(null);

      try {
        const response = await fetch(`/api/feeds/fetch?url=${encodeURIComponent(selectedFeedUrl)}`);
        const data = await response.json();

        if (!response.ok) {
          setStatus(data.error || "Could not load this feed.");
          setFeedData(null);
          setSelectedArticle(null);
          return;
        }

        setFeedData(data);
        setSelectedArticle(data.items?.[0] || null);
      } catch {
        setStatus("Could not reach the feed parser.");
      } finally {
        setIsLoadingFeed(false);
      }
    }

    loadFeed();
  }, [selectedFeedUrl]);

  useEffect(() => {
    if (!selectedFeedUrl || isLoadingSession) return;

    async function loadArticleStates() {
      if (!user) {
        const stored = localStorage.getItem(GUEST_ARTICLE_STATES_KEY);
        setArticleStates(stored ? JSON.parse(stored) : {});
        return;
      }

      const response = await fetch(`/api/articles/state?feedUrl=${encodeURIComponent(selectedFeedUrl)}`);
      if (!response.ok) return;
      const data = await response.json();
      const states = (data.states || []).reduce(
        (acc: Record<string, ArticleState>, state: { feedUrl: string; articleId: string; read: boolean; bookmarked: boolean }) => {
          acc[`${state.feedUrl}::${state.articleId}`] = {
            read: state.read,
            bookmarked: state.bookmarked,
          };
          return acc;
        },
        {}
      );
      setArticleStates((current) => ({ ...current, ...states }));
    }

    loadArticleStates();
  }, [isLoadingSession, selectedFeedUrl, user]);

  const categories = useMemo(
    () => ["All Feeds", ...Array.from(new Set(subscriptions.map((subscription) => subscription.category || "General")))],
    [subscriptions]
  );

  const visibleSubscriptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return subscriptions.filter((subscription) => {
      const matchesCategory = activeCategory === "All Feeds" || subscription.category === activeCategory;
      const matchesSearch =
        !normalizedSearch ||
        subscription.title.toLowerCase().includes(normalizedSearch) ||
        subscription.description.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search, subscriptions]);

  const selectedSubscription = subscriptions.find((subscription) => subscription.feedUrl === selectedFeedUrl);
  const selectedArticleState = selectedArticle ? articleStates[articleKey(selectedFeedUrl, selectedArticle)] || {} : {};
  const safeContent = selectedArticle
    ? sanitizeArticleHtml(selectedArticle.content || selectedArticle.summary || "")
    : "";

  const persistGuestSubscriptions = (nextSubscriptions: Subscription[]) => {
    setSubscriptions(nextSubscriptions);
    localStorage.setItem(GUEST_SUBSCRIPTIONS_KEY, JSON.stringify(nextSubscriptions));
  };

  const saveArticleState = async (article: NormalizedItem, patch: ArticleState) => {
    const key = articleKey(selectedFeedUrl, article);
    const nextState = { ...(articleStates[key] || {}), ...patch };
    const nextStates = { ...articleStates, [key]: nextState };

    setArticleStates(nextStates);

    if (!user) {
      localStorage.setItem(GUEST_ARTICLE_STATES_KEY, JSON.stringify(nextStates));
      return;
    }

    await fetch("/api/articles/state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feedUrl: selectedFeedUrl,
        articleId: getArticleId(article),
        ...patch,
      }),
    });
  };

  const selectArticle = (article: NormalizedItem) => {
    setSelectedArticle(article);
    saveArticleState(article, { read: true });
  };

  const addFeed = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    const trimmedFeedUrl = feedUrlInput.trim();
    const trimmedCategory = categoryInput.trim() || "General";

    if (!FEED_URL_REGEX.test(trimmedFeedUrl)) {
      setStatus("Enter a valid RSS or Atom URL starting with http:// or https://.");
      return;
    }

    if (!CATEGORY_REGEX.test(trimmedCategory)) {
      setStatus("Category must be 2-40 characters using letters, numbers, spaces, &, /, _ or -.");
      return;
    }

    const response = await fetch(`/api/feeds/preview?url=${encodeURIComponent(trimmedFeedUrl)}`);
    const preview = await response.json();

    if (!response.ok) {
      setStatus(preview.error || "That feed could not be previewed.");
      return;
    }

    const nextSubscription: Subscription = {
      title: preview.title,
      feedUrl: trimmedFeedUrl,
      siteUrl: preview.link,
      description: preview.description || "",
      format: "rss",
      category: trimmedCategory,
    };

    if (user) {
      const saveResponse = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedUrl: trimmedFeedUrl, category: nextSubscription.category }),
      });
      const saved = await saveResponse.json();

      if (!saveResponse.ok) {
        setStatus(saved.message || "Could not save this subscription.");
        return;
      }

      nextSubscription._id = saved.subscription?._id;
    }

    const nextSubscriptions = [...subscriptions, nextSubscription];
    if (user) {
      setSubscriptions(nextSubscriptions);
    } else {
      persistGuestSubscriptions(nextSubscriptions);
    }

    setSelectedFeedUrl(trimmedFeedUrl);
    setFeedUrlInput("");
    setCategoryInput("General");
    setIsAddOpen(false);
  };

  const importOpml = async (file: File | null) => {
    if (!file) return;
    setStatus(null);

    if (!user) {
      const text = await file.text();
      const matches = Array.from(text.matchAll(/xmlUrl=["']([^"']+)["']/gi));
      const imported = matches
        .map((match) => {
          try {
            return {
              title: match[1],
              feedUrl: match[1],
              siteUrl: new URL(match[1]).origin,
              description: "Imported from OPML",
              format: "rss",
              category: "Imported",
            };
          } catch {
            return null;
          }
        })
        .filter((feed): feed is Subscription => Boolean(feed));
      const nextSubscriptions = [...subscriptions, ...imported];
      persistGuestSubscriptions(nextSubscriptions);
      setStatus(`Imported ${imported.length} feeds for this guest session.`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/opml/import", { method: "POST", body: formData });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.message || "Could not import this OPML file.");
      return;
    }

    setSubscriptions((current) => [...current, ...data.imported]);
    setStatus(`Imported ${data.imported.length} feeds. Skipped ${data.skipped.length}.`);
  };

  const removeSubscription = async (subscription: Subscription) => {
    const nextSubscriptions = subscriptions.filter((item) => item.feedUrl !== subscription.feedUrl);

    if (user && subscription._id) {
      await fetch(`/api/subscriptions/${subscription._id}`, { method: "DELETE" });
      setSubscriptions(nextSubscriptions);
    } else {
      persistGuestSubscriptions(nextSubscriptions);
    }

    if (selectedFeedUrl === subscription.feedUrl) {
      setSelectedFeedUrl(nextSubscriptions[0]?.feedUrl || "");
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setSubscriptions(sampleSubscriptions);
    setSelectedFeedUrl(sampleSubscriptions[0]?.feedUrl || "");
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-4 text-sm font-medium text-zinc-500 md:flex">
              <button className="text-zinc-950 dark:text-white">Feed</button>
              <button>Digest</button>
              <button>Discover</button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search feeds"
                className="h-9 w-48 rounded-md border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              aria-label="Add feed"
            >
              <Plus className="h-4 w-4" />
            </button>
            <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              <FileUp className="h-4 w-4" />
              <input type="file" accept=".opml,.xml,text/xml" className="sr-only" onChange={(event) => importOpml(event.target.files?.[0] || null)} />
            </label>
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {user ? (
              <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                <User className="h-4 w-4 text-zinc-500" />
                <span className="hidden max-w-28 truncate sm:inline">{user.firstName || user.username || user.email}</span>
                <button type="button" onClick={logout} aria-label="Log out">
                  <LogOut className="h-4 w-4 text-zinc-500 hover:text-red-500" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex h-9 items-center gap-2 rounded-md bg-zinc-900 px-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Log in</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="grid flex-1 md:grid-cols-[16rem_minmax(20rem,24rem)_1fr]">
        <aside className="hidden border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:block">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {isGuest ? "Guest Feeds" : "My Feeds"}
          </div>
          <nav className="space-y-1">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                  activeCategory === category
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <span>{category}</span>
                <span className="text-xs opacity-60">
                  {category === "All Feeds" ? subscriptions.length : subscriptions.filter((item) => item.category === category).length}
                </span>
              </button>
            ))}
          </nav>
          {status && <p className="mt-4 rounded-md bg-zinc-100 p-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">{status}</p>}
        </aside>

        <section className="border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Sources</p>
            <h1 className="mt-1 text-2xl font-bold">Latest Posts</h1>
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
                  onClick={() => removeSubscription(subscription)}
                  className="mt-2 hidden h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-500 group-hover:flex dark:hover:bg-red-950/30"
                  aria-label="Remove subscription"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <main className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(18rem,26rem)_1fr]">
          <section className="border-r border-zinc-200 dark:border-zinc-800">
            <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-sm font-semibold">{selectedSubscription?.title || feedData?.title || "Select a feed"}</p>
              <p className="mt-1 text-xs text-zinc-500">{feedData?.items.length || 0} articles loaded</p>
            </div>
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
              {isLoadingFeed && <p className="p-4 text-sm text-zinc-500">Loading feed...</p>}
              {!isLoadingFeed &&
                feedData?.items.map((article) => {
                  const state = articleStates[articleKey(selectedFeedUrl, article)] || {};
                  return (
                    <button
                      key={article.guid || article.link || article.title}
                      type="button"
                      onClick={() => selectArticle(article)}
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
                      onClick={() => saveArticleState(selectedArticle, { bookmarked: !selectedArticleState.bookmarked })}
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
                  dangerouslySetInnerHTML={{ __html: safeContent || `<p>${stripHtml(selectedArticle.summary)}</p>` }}
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
        </main>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={addFeed} className="w-full max-w-md rounded-md bg-white p-5 shadow-xl dark:bg-zinc-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Feed</h2>
              <button type="button" onClick={() => setIsAddOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
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
            <button type="submit" className="h-10 w-full rounded-md bg-zinc-900 font-semibold text-white dark:bg-white dark:text-zinc-950">
              Subscribe
            </button>
          </form>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={refreshSession} />
    </div>
  );
}
