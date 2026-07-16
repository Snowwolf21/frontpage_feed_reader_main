"use client";

import { useMemo } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Rss,
  Code,
  Palette,
  Terminal,
  Cpu,
  Brain,
  Folder,
  Trash2,
} from "lucide-react";
import { useStore } from "@/app/store/useStore";
import { Button } from "@/components/ui/button";

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case "all feeds":
      return <Rss className="h-4 w-4" />;
    case "frontend":
      return <Code className="h-4 w-4" />;
    case "design":
      return <Palette className="h-4 w-4" />;
    case "backend & devops":
    case "backend":
    case "devops":
      return <Terminal className="h-4 w-4" />;
    case "general tech":
    case "tech":
      return <Cpu className="h-4 w-4" />;
    case "ai & ml":
    case "ai":
    case "ml":
      return <Brain className="h-4 w-4" />;
    default:
      return <Folder className="h-4 w-4" />;
  }
}

export default function DashboardSidebar() {
  const {
    user,
    subscriptions,
    activeCategory,
    status,
    setActiveCategory,
    isSidebarCollapsed,
    toggleSidebar,
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

  const isGuest = !user;

  const categories = useMemo(
    () => ["All Feeds", ...Array.from(new Set(subscriptions.map((sub) => sub.category || "General")))],
    [subscriptions]
  );

  return (
    <aside 
      className={`hidden border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:block transition-all duration-300 ease-in-out relative ${
        isSidebarCollapsed ? "w-16 p-3 border-r" : "w-64 p-4 border-r"
      }`}
    >
     
      
      <div className="transition-all duration-200">
        <div className={`mb-4 flex items-center h-9 ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
          {!isSidebarCollapsed && (
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
              {isGuest ? "Guest Feeds" : "My Feeds"}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="h-9 w-9 flex items-center justify-center shrink-0"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="space-y-1">
          {categories.map((category) => {
            const count = category === "All Feeds" ? subscriptions.length : subscriptions.filter((item) => item.category === category).length;
            const icon = getCategoryIcon(category);

            return (
              <Button
                key={category}
                type="button"
                variant={activeCategory === category ? "default" : "ghost"}
                onClick={() => setActiveCategory(category)}
                title={isSidebarCollapsed ? `${category} (${count})` : undefined}
                className={`flex w-full items-center transition-all font-normal h-9 ${
                  isSidebarCollapsed 
                    ? "justify-center px-0 w-10 mx-auto" 
                    : "justify-between px-3"
                } ${
                  activeCategory === category
                    ? ""
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <span className="flex items-center gap-3">
                  {icon}
                  {!isSidebarCollapsed && <span className="truncate">{category}</span>}
                </span>
                {!isSidebarCollapsed && (
                  <span className="text-xs opacity-60">
                    {count}
                  </span>
                )}
              </Button>
            );
          })}
        </nav>
        {!isSidebarCollapsed && (
          <>
            <hr className="my-4 border-zinc-200 dark:border-zinc-800" />
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Sources ({visibleSubscriptions.length})
            </div>
            <div className="max-h-[calc(100vh-22rem)] overflow-y-auto space-y-1 px-1">
              {visibleSubscriptions.length === 0 ? (
                <div className="p-3 text-xs text-zinc-500">No feeds in this category</div>
              ) : (
                visibleSubscriptions.map((subscription) => (
                  <div key={subscription.feedUrl} className="group relative flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSelectedFeedUrl(subscription.feedUrl)}
                      className={`flex flex-1 items-center justify-start gap-2.5 px-3 py-2 rounded-md h-auto text-left outline-none ${
                        selectedFeedUrl === subscription.feedUrl
                          ? "bg-zinc-150 text-zinc-950 font-semibold dark:bg-zinc-900 dark:text-white"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/60"
                      }`}
                    >
                      <Rss className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                      <span className="min-w-0 flex-1 truncate text-xs">{subscription.title}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSubscription(subscription)}
                      className="absolute right-2 h-7 w-7 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove subscription"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        {status && !isSidebarCollapsed && (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 rounded-md bg-zinc-100 p-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {status}
          </p>
        )}
      </div>
    </aside>
  );
}
