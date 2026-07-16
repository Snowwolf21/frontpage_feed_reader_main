"use client";

import { useEffect, useMemo } from "react";
import AuthModal from "@/app/components/AuthModal";
import type { SampleFeeds } from "@/app/components/FeedDisplay";
import { useStore } from "@/app/store/useStore";
import type { Subscription } from "@/app/store/useStore";

import DashboardHeader from "./components/DashboardHeader";
import DashboardSidebar from "./components/DashboardSidebar";
import FeedSourcesList from "./components/FeedSourcesList";
import ArticlesList from "./components/ArticlesList";
import ArticleViewer from "./components/ArticleViewer";
import AddFeedModal from "./components/AddFeedModal";
import MobileNavigation from "./components/MobileNavigation";
import DiscoverView from "./components/DiscoverView";
import DigestView from "./components/DigestView";

const THEME_KEY = "frontpage:theme";

function flattenSampleFeeds(sampleFeeds: SampleFeeds): Subscription[] {
  return sampleFeeds.categories.flatMap((category) =>
    category.feeds.map((feed) => ({
      ...feed,
      category: category.name,
    }))
  );
}

export default function DashboardClient({ sampleFeeds }: { sampleFeeds: SampleFeeds }) {
  const sampleSubscriptions = useMemo(() => flattenSampleFeeds(sampleFeeds), [sampleFeeds]);

  // Bind Zustand Store state & actions
  const {
    isLoadingSession,
    isAuthOpen,
    theme,
    sessionExpired,
    mounted,
    setMounted,
    setTheme,
    setSessionExpired,
    setIsAuthOpen,
    refreshSession,
    loadSubscriptions,
    loadFeed,
    loadArticleStates,
    selectedFeedUrl,
    setIsSidebarCollapsed,
    viewMode,
    activeTab,
  } = useStore();

  // Effects
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      refreshSession();

      // Load sidebar collapsed state
      try {
        const saved = localStorage.getItem("frontpage:sidebar-collapsed");
        if (saved === "true") {
          setIsSidebarCollapsed(true);
        }
      } catch (e) {
        console.warn("localStorage is not accessible:", e);
      }

      // Load theme state
      let storedTheme: "light" | "dark" | null = null;
      try {
        storedTheme = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
      } catch (e) {
        console.warn("localStorage is not accessible:", e);
      }
      const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(storedTheme || preferredTheme);
    }, 0);
  }, [refreshSession, setMounted, setTheme, setIsSidebarCollapsed]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn("localStorage is not accessible:", e);
    }
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
            onClick={() => {
              setSessionExpired(false);
              setIsAuthOpen(true);
            }}
            className="font-semibold underline hover:no-underline"
          >
            log in again
          </button>
          <button
            type="button"
            onClick={() => setSessionExpired(false)}
            aria-label="Dismiss"
            className="ml-2 opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      <DashboardHeader sampleSubscriptions={sampleSubscriptions} />

      {/* View Swapping Layout */}
      {activeTab === "discover" && <DiscoverView />}
      {activeTab === "digest" && <DigestView />}
      
      {activeTab === "feed" && (
        <div className="grid flex-1 grid-cols-1 md:grid-cols-[auto_1fr]">
          {/* Left Sidebar: Collapsible navigation pane */}
          <DashboardSidebar />

          {/* Content Pane Area */}
          <div className="flex-1 min-w-0">
            {/* Desktop Layout: Split Timeline and Reader view */}
            <div className="hidden md:grid min-h-[calc(100vh-4rem)] grid-cols-[minmax(18rem,24rem)_1fr]">
              <ArticlesList />
              <ArticleViewer />
            </div>

            {/* Mobile Layout: Panel-swapping single view */}
            <div className="md:hidden min-h-[calc(100vh-4rem)] flex flex-col">
              {viewMode === "sources" && <FeedSourcesList />}
              {viewMode === "articles" && <ArticlesList />}
              {viewMode === "reader" && <ArticleViewer />}
            </div>
          </div>
        </div>
      )}

      <AddFeedModal />

      <MobileNavigation />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={refreshSession} />
    </div>
  );
}