import { create } from "zustand";
import type { Feed } from "@/app/components/FeedDisplay";
import type { FeedResponse, NormalizedItem } from "@/app/api/feeds/_lib/feedParser";

export interface UserProfile {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
}

export type Subscription = Feed & {
  _id?: string;
  category: string;
};

export type ArticleState = {
  read?: boolean;
  bookmarked?: boolean;
};

const GUEST_SUBSCRIPTIONS_KEY = "frontpage:guest-subscriptions";
const GUEST_ARTICLE_STATES_KEY = "frontpage:guest-article-states";
const FEED_URL_REGEX = /^https?:\/\/(?:[\w-]+\.)+[\w-]{2,}(?::\d{2,5})?(?:\/[^\s]*)?$/i;
const CATEGORY_REGEX = /^[A-Za-z0-9][A-Za-z0-9 &/_-]{1,39}$/;

function articleKey(feedUrl: string, article: NormalizedItem) {
  return `${feedUrl}::${article.guid || article.link || article.title}`;
}

function getArticleId(article: NormalizedItem) {
  return article.guid || article.link || article.title;
}

interface StoreState {
  // State
  user: UserProfile | null;
  isLoadingSession: boolean;
  subscriptions: Subscription[];
  activeCategory: string;
  selectedFeedUrl: string;
  search: string;
  feedData: FeedResponse | null;
  selectedArticle: NormalizedItem | null;
  articleStates: Record<string, ArticleState>;
  isLoadingFeed: boolean;
  status: string | null;
  isAuthOpen: boolean;
  isAddOpen: boolean;
  isAddingFeed: boolean;
  feedUrlInput: string;
  categoryInput: string;
  theme: "light" | "dark";
  sessionExpired: boolean;
  mounted: boolean;
  isSidebarCollapsed: boolean;
  viewMode: "sources" | "articles" | "reader";
  activeTab: "feed" | "digest" | "discover";

  // Simple Setters
  setUser: (user: UserProfile | null) => void;
  setIsLoadingSession: (loading: boolean) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setActiveCategory: (category: string) => void;
  setSelectedFeedUrl: (url: string) => void;
  setSearch: (search: string) => void;
  setFeedData: (data: FeedResponse | null) => void;
  setSelectedArticle: (article: NormalizedItem | null) => void;
  setArticleStates: (states: Record<string, ArticleState> | ((curr: Record<string, ArticleState>) => Record<string, ArticleState>)) => void;
  setIsLoadingFeed: (loading: boolean) => void;
  setStatus: (status: string | null) => void;
  setIsAuthOpen: (open: boolean) => void;
  setIsAddOpen: (open: boolean) => void;
  setIsAddingFeed: (loading: boolean) => void;
  setFeedUrlInput: (input: string) => void;
  setCategoryInput: (input: string) => void;
  setTheme: (theme: "light" | "dark") => void;
  setSessionExpired: (expired: boolean) => void;
  setMounted: (mounted: boolean) => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setViewMode: (mode: "sources" | "articles" | "reader") => void;
  setActiveTab: (tab: "feed" | "digest" | "discover") => void;

  // Actions
  toggleSidebar: () => void;
  refreshSession: () => Promise<void>;
  loadSubscriptions: (sampleSubscriptions: Subscription[]) => Promise<void>;
  loadFeed: (feedUrl: string) => Promise<void>;
  loadArticleStates: (feedUrl: string) => Promise<void>;
  saveArticleState: (feedUrl: string, article: NormalizedItem, patch: ArticleState) => Promise<void>;
  selectArticle: (feedUrl: string, article: NormalizedItem) => void;
  addFeed: () => Promise<boolean>;
  importOpml: (file: File | null) => Promise<void>;
  removeSubscription: (subscription: Subscription) => Promise<void>;
  logout: (sampleSubscriptions: Subscription[]) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial State
  user: null,
  isLoadingSession: true,
  subscriptions: [],
  activeCategory: "All Feeds",
  selectedFeedUrl: "",
  search: "",
  feedData: null,
  selectedArticle: null,
  articleStates: {},
  isLoadingFeed: false,
  status: null,
  isAuthOpen: false,
  isAddOpen: false,
  isAddingFeed: false,
  feedUrlInput: "",
  categoryInput: "General",
  theme: "light",
  sessionExpired: false,
  mounted: false,
  isSidebarCollapsed: false,
  viewMode: "sources",
  activeTab: "feed",

  // Setters
  setUser: (user) => set({ user }),
  setIsLoadingSession: (isLoadingSession) => set({ isLoadingSession }),
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setSelectedFeedUrl: (selectedFeedUrl) => set({ selectedFeedUrl, viewMode: "articles" }),
  setViewMode: (viewMode) => set({ viewMode }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSearch: (search) => set({ search }),
  setFeedData: (feedData) => set({ feedData }),
  setSelectedArticle: (selectedArticle) => set({ selectedArticle }),
  setArticleStates: (arg) => {
    if (typeof arg === "function") {
      set((state) => ({ articleStates: arg(state.articleStates) }));
    } else {
      set({ articleStates: arg });
    }
  },
  setIsLoadingFeed: (isLoadingFeed) => set({ isLoadingFeed }),
  setStatus: (status) => set({ status }),
  setIsAuthOpen: (isAuthOpen) => set({ isAuthOpen }),
  setIsAddOpen: (isAddOpen) => set({ isAddOpen }),
  setIsAddingFeed: (isAddingFeed) => set({ isAddingFeed }),
  setFeedUrlInput: (feedUrlInput) => set({ feedUrlInput }),
  setCategoryInput: (categoryInput) => set({ categoryInput }),
  setTheme: (theme) => set({ theme }),
  setSessionExpired: (sessionExpired) => set({ sessionExpired }),
  setMounted: (mounted) => set({ mounted }),
  setIsSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),

  // Actions
  toggleSidebar: () => {
    const next = !get().isSidebarCollapsed;
    set({ isSidebarCollapsed: next });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("frontpage:sidebar-collapsed", String(next));
      } catch (e) {
        console.warn("localStorage is not accessible:", e);
      }
    }
  },
  refreshSession: async () => {
    set({ isLoadingSession: true });
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      const nextUser = data.user || null;

      const wasAuthenticated = !!get().user;
      if (wasAuthenticated && !nextUser) {
        set({ sessionExpired: true });
      }
      set({ user: nextUser });
    } catch {
      set({ user: null });
    } finally {
      set({ isLoadingSession: false });
    }
  },

  loadSubscriptions: async (sampleSubscriptions) => {
    const { user } = get();
    if (!user) {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem(GUEST_SUBSCRIPTIONS_KEY);
          const guestSubscriptions = stored ? (JSON.parse(stored) as Subscription[]) : sampleSubscriptions;
          set({
            subscriptions: guestSubscriptions,
            selectedFeedUrl: get().selectedFeedUrl || guestSubscriptions[0]?.feedUrl || "",
          });
        } catch (e) {
          console.error("Failed to load subscriptions from localStorage", e);
          set({
            subscriptions: sampleSubscriptions,
            selectedFeedUrl: get().selectedFeedUrl || sampleSubscriptions[0]?.feedUrl || "",
          });
        }
      }
      return;
    }

    try {
      const response = await fetch("/api/subscriptions");
      if (!response.ok) return;
      const data = await response.json();
      const savedSubscriptions = (data.subscriptions || []) as Subscription[];
      set({
        subscriptions: savedSubscriptions,
        selectedFeedUrl: get().selectedFeedUrl || savedSubscriptions[0]?.feedUrl || "",
      });
    } catch (err) {
      console.error("Failed to load subscriptions", err);
    }
  },

  loadFeed: async (feedUrl) => {
    if (!feedUrl) return;
    set({ isLoadingFeed: true, status: null });

    try {
      const response = await fetch(`/api/feeds/fetch?url=${encodeURIComponent(feedUrl)}`);
      const data = await response.json();

      // Ensure that selectedFeedUrl hasn't changed since this fetch started
      if (get().selectedFeedUrl !== feedUrl) return;

      if (!response.ok) {
        set({
          status: data.error || "Could not load this feed.",
          feedData: null,
          selectedArticle: null,
        });
        return;
      }

      set({
        feedData: data,
        selectedArticle: data.items?.[0] || null,
      });
    } catch {
      if (get().selectedFeedUrl === feedUrl) {
        set({ status: "Could not reach the feed parser." });
      }
    } finally {
      if (get().selectedFeedUrl === feedUrl) {
        set({ isLoadingFeed: false });
      }
    }
  },

  loadArticleStates: async (feedUrl) => {
    const { user, isLoadingSession } = get();
    if (!feedUrl || isLoadingSession) return;

    if (!user) {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem(GUEST_ARTICLE_STATES_KEY);
          set({ articleStates: stored ? JSON.parse(stored) : {} });
        } catch (e) {
          console.error("Failed to load article states from localStorage", e);
          set({ articleStates: {} });
        }
      }
      return;
    }

    try {
      const response = await fetch(`/api/articles/state?feedUrl=${encodeURIComponent(feedUrl)}`);
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
      set((state) => ({
        articleStates: { ...state.articleStates, ...states },
      }));
    } catch (err) {
      console.error("Failed to load article states", err);
    }
  },

  saveArticleState: async (feedUrl, article, patch) => {
    const key = articleKey(feedUrl, article);
    const { articleStates, user } = get();
    const nextState = { ...(articleStates[key] || {}), ...patch };
    const nextStates = { ...articleStates, [key]: nextState };

    set({ articleStates: nextStates });

    if (!user) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(GUEST_ARTICLE_STATES_KEY, JSON.stringify(nextStates));
        } catch (e) {
          console.error("Failed to save article states to localStorage", e);
        }
      }
      return;
    }

    try {
      await fetch("/api/articles/state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedUrl,
          articleId: getArticleId(article),
          ...patch,
        }),
      });
    } catch (err) {
      console.error("Failed to save article state to database", err);
    }
  },

  selectArticle: (feedUrl, article) => {
    set({ selectedArticle: article, viewMode: "reader" });
    get().saveArticleState(feedUrl, article, { read: true });
  },

  addFeed: async () => {
    set({ status: null });
    const { feedUrlInput, categoryInput, user, subscriptions } = get();

    const trimmedFeedUrl = feedUrlInput.trim();
    const trimmedCategory = categoryInput.trim() || "General";

    if (!FEED_URL_REGEX.test(trimmedFeedUrl)) {
      set({ status: "Enter a valid RSS or Atom URL starting with http:// or https://." });
      return false;
    }

    if (!CATEGORY_REGEX.test(trimmedCategory)) {
      set({ status: "Category must be 2-40 characters using letters, numbers, spaces, &, /, _ or -." });
      return false;
    }

    set({ isAddingFeed: true });
    try {
      const response = await fetch(`/api/feeds/preview?url=${encodeURIComponent(trimmedFeedUrl)}`);
      const preview = await response.json();

      if (!response.ok) {
        set({ status: preview.error || "That feed could not be previewed." });
        return false;
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
          set({ status: saved.message || "Could not save this subscription." });
          return false;
        }

        nextSubscription._id = saved.subscription?._id;
      }

      const nextSubscriptions = [...subscriptions, nextSubscription];
      if (user) {
        set({ subscriptions: nextSubscriptions });
      } else {
        set({ subscriptions: nextSubscriptions });
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(GUEST_SUBSCRIPTIONS_KEY, JSON.stringify(nextSubscriptions));
          } catch (e) {
            console.error("Failed to save subscriptions to localStorage", e);
          }
        }
      }

      set({
        selectedFeedUrl: trimmedFeedUrl,
        feedUrlInput: "",
        categoryInput: "General",
        isAddOpen: false,
      });
      return true;
    } catch {
      set({ status: "Error adding new subscription source." });
      return false;
    } finally {
      set({ isAddingFeed: false });
    }
  },

  importOpml: async (file) => {
    if (!file) return;
    set({ status: null });
    const { user, subscriptions } = get();

    try {
      if (!user) {
        const text = await file.text();
        const matches = Array.from(text.matchAll(/xmlUrl=["']([^"']+)["']/gi));
        const imported = matches
          .map((match) => {
            try {
              const url = match[1];
              if (!/^https?:\/\//.test(url)) return null;
              return {
                title: url,
                feedUrl: url,
                siteUrl: new URL(url).origin,
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
        set({ subscriptions: nextSubscriptions });
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(GUEST_SUBSCRIPTIONS_KEY, JSON.stringify(nextSubscriptions));
          } catch (e) {
            console.error("Failed to save subscriptions to localStorage", e);
          }
        }
        set({ status: `Imported ${imported.length} feeds for this guest session.` });
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/opml/import", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        set({ status: data.message || "Could not import this OPML file." });
        return;
      }

      set((state) => ({
        subscriptions: [...state.subscriptions, ...data.imported],
        status: `Imported ${data.imported.length} feeds. Skipped ${data.skipped.length}.`,
      }));
    } catch {
      set({ status: "Parsing error occurred during OPML import." });
    }
  },

  removeSubscription: async (subscription) => {
    const { user, subscriptions, selectedFeedUrl } = get();
    const nextSubscriptions = subscriptions.filter((item) => item.feedUrl !== subscription.feedUrl);

    if (user && subscription._id) {
      try {
        await fetch(`/api/subscriptions/${subscription._id}`, { method: "DELETE" });
        set({ subscriptions: nextSubscriptions });
      } catch {
        set({ status: "Could not remove the subscription from your account." });
        return;
      }
    } else {
      set({ subscriptions: nextSubscriptions });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(GUEST_SUBSCRIPTIONS_KEY, JSON.stringify(nextSubscriptions));
        } catch (e) {
          console.error("Failed to save subscriptions to localStorage", e);
        }
      }
    }

    if (selectedFeedUrl === subscription.feedUrl) {
      const nextUrl = nextSubscriptions[0]?.feedUrl || "";
      set({ selectedFeedUrl: nextUrl });

      if (!nextUrl) {
        set({ feedData: null, selectedArticle: null });
      }
    }
  },

  logout: async (sampleSubscriptions) => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      set({
        user: null,
        subscriptions: sampleSubscriptions,
      });

      const nextUrl = sampleSubscriptions[0]?.feedUrl || "";
      set({ selectedFeedUrl: nextUrl });

      if (!nextUrl) {
        set({ feedData: null, selectedArticle: null });
      }
    }
  },
}));
