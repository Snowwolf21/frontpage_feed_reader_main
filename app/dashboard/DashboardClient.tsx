"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo } from "react";
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
import type { SampleFeeds } from "@/app/components/FeedDisplay";
import type { NormalizedItem } from "@/app/api/feeds/_lib/feedParser";
import Logo from "@/components/ui/logo";
import { useStore } from "@/app/store/useStore";
import type { Subscription } from "@/app/store/useStore";

const THEME_KEY = "frontpage:theme";

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

/** Escapes HTML special chars so user-controlled strings are safe in innerHTML. */
function escapeHtml(str: string | null) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strips all HTML tags to produce plain text (used for article list snippet). */
function stripHtml(html: string | null) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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

export default function DashboardClient({ sampleFeeds }: { sampleFeeds: SampleFeeds }) {
  const sampleSubscriptions = useMemo(() => flattenSampleFeeds(sampleFeeds), [sampleFeeds]);

  // Bind Zustand Store state & actions
  const {
    user,
    isLoadingSession,
    subscriptions,
    activeCategory,
    selectedFeedUrl,
    search,
    feedData,
    selectedArticle,
    articleStates,
    isLoadingFeed,
    status,
    isAuthOpen,
    isAddOpen,
    theme,
    sessionExpired,
    mounted,
    setMounted,
    setTheme,
    setSessionExpired,
    setIsAuthOpen,
    setStatus,
    refreshSession,
    loadSubscriptions,
    loadFeed,
    loadArticleStates,
    setActiveCategory,
    setSearch,
    setSelectedFeedUrl,
    setIsAddOpen,
    addFeed,
    importOpml,
    removeSubscription,
    logout,
    selectArticle,
    saveArticleState,
    isAddingFeed,
    feedUrlInput,
    categoryInput,
    setFeedUrlInput,
    setCategoryInput,
  } = useStore();

  const isGuest = !user;

  // Effects
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      refreshSession();

      const storedTheme = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
      const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(storedTheme || preferredTheme);
    }, 0);
  }, [refreshSession, setMounted, setTheme]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (isLoadingSession) return;
    loadSubscriptions(sampleSubscriptions);
  }, [isLoadingSession, loadSubscriptions, sampleSubscriptions]);

  useEffect(() => {
    loadFeed(selectedFeedUrl);
  }, [selectedFeedUrl, loadFeed]);

  useEffect(() => {
    loadArticleStates(selectedFeedUrl);
  }, [selectedFeedUrl, loadArticleStates]);

  // Derived State Memos
  const categories = useMemo(
    () => ["All Feeds", ...Array.from(new Set(subscriptions.map((sub) => sub.category || "General")))],
    [subscriptions]
  );

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

  const selectedSubscription = subscriptions.find((sub) => sub.feedUrl === selectedFeedUrl);
  const selectedArticleState = selectedArticle ? articleStates[articleKey(selectedFeedUrl, selectedArticle)] || {} : {};
  
  // Handled client-side to strictly avoid Next.js HTML hydration mismatches
  const safeContent = useMemo(() => {
    if (!mounted || !selectedArticle) return "";
    return sanitizeArticleHtml(selectedArticle.content || selectedArticle.summary || "");
  }, [selectedArticle, mounted]);

  // Actions event handlers
  const handleAddFeedSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await addFeed();
  };

  const handleImportOpml = async (file: File | null) => {
    await importOpml(file);
  };

  const handleRemoveSubscription = async (subscription: Subscription) => {
    await removeSubscription(subscription);
  };

  const handleLogout = async () => {
    await logout(sampleSubscriptions);
  };

  const handleSelectArticle = (article: NormalizedItem) => {
    selectArticle(selectedFeedUrl, article);
  };

  const handleToggleBookmark = async (article: NormalizedItem, currentBookmarked: boolean) => {
    await saveArticleState(selectedFeedUrl, article, { bookmarked: !currentBookmarked });
  };

  // Prevent flash or parsing errors during absolute early server pass
  if (!mounted) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Screen-reader-only page h1 for correct heading hierarchy */}
      <h1 className="sr-only">Frontpage Dashboard</h1>

      {/* Session expiry notification */}
      {sessionExpired && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm text-amber-200 shadow-lg backdrop-blur-sm"
        >
          <span>Your session has expired. Please</span>
          <button
            type="button"
            onClick={() => { setSessionExpired(false); setIsAuthOpen(true); }}
            className="font-semibold underline hover:no-underline"
          >
            log in again
          </button>
          <button type="button" onClick={() => setSessionExpired(false)} aria-label="Dismiss" className="ml-2 opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Logo />
            </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium text-zinc-500 md:flex">
              <button type="button" className="text-zinc-950 dark:text-white">Feed</button>
              <button type="button" onClick={() => setStatus("Digest — coming soon!")} className="hover:text-zinc-950 dark:hover:text-white transition-colors">Digest</button>
              <button type="button" onClick={() => setStatus("Discover — coming soon!")} className="hover:text-zinc-950 dark:hover:text-white transition-colors">Discover</button>
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
              <input type="file" accept=".opml,.xml,text/xml" className="sr-only" onChange={(event) => handleImportOpml(event.target.files?.[0] || null)} />
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
                <button type="button" onClick={handleLogout} aria-label="Log out">
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
          {status && (
            <p
              role="status"
              aria-live="polite"
              className="mt-4 rounded-md bg-zinc-100 p-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {status}
            </p>
          )}
        </aside>

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

        <main className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(18rem,26rem)_1fr]">
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
        </main>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddFeedSubmit} className="w-full max-w-md rounded-md bg-white p-5 shadow-xl dark:bg-zinc-900">
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
            <button
              type="submit"
              disabled={isAddingFeed}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-zinc-900 font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-950"
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
            </button>
          </form>
        </div>
      )}

      {/* Mobile bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-zinc-200 bg-white/95 pb-safe px-2 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden">
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex flex-col items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
        >
          <Plus className="h-5 w-5" />
          <span>Add</span>
        </button>
        <label className="flex flex-col items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white cursor-pointer">
          <FileUp className="h-5 w-5" />
          <span>Import</span>
          <input type="file" accept=".opml,.xml,text/xml" className="sr-only" onChange={(event) => handleImportOpml(event.target.files?.[0] || null)} />
        </label>
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex flex-col items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span>Theme</span>
        </button>
        {user ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-xs text-zinc-500 hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            className="flex flex-col items-center gap-1 text-xs text-zinc-900 dark:text-white"
          >
            <LogIn className="h-5 w-5" />
            <span>Log in</span>
          </button>
        )}
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={refreshSession} />
    </div>
  );
}